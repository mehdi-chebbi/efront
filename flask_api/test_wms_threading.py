#!/usr/bin/env python3
"""
Test script to demonstrate WMS image download threading performance improvement.
This simulates multiple concurrent WMS download requests.
"""

import requests
import json
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

# Test configuration
BASE_URL = "http://192.168.2.124"
TEST_REQUESTS = 3  # Number of concurrent WMS requests to test

def make_wms_request(request_id):
    """Make a single WMS satellite image download request"""
    print(f"🛰 WMS Request {request_id}: Starting at {time.strftime('%H:%M:%S')}")
    
    start_time = time.time()
    
    # Sample WMS satellite image download request
    test_data = {
        "wms_url": "https://sh.dataspace.copernicus.eu/ogc/wms/2e44e6fc-1f1c-4258-bd09-8a15c317f604?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=NDVI-L2A&BBOX=0,0,1,1&CRS=EPSG:4326&WIDTH=500&HEIGHT=500&FORMAT=image/png&TIME=2024-01-01/2024-01-31&MAXCC=20",
        "layer": "NDVI-L2A",
        "date_range": "2024-01-01 to 2024-01-31",
        "cloud_coverage": "20",
        "location_name": "Test Area",
        "address_details": {}
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/vision/analyze_satellite",
            json=test_data,
            timeout=120  # 2 minute timeout
        )
        
        end_time = time.time()
        duration = end_time - start_time
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ WMS Request {request_id}: Completed in {duration:.2f} seconds")
            return {"request_id": request_id, "duration": duration, "success": True}
        else:
            print(f"❌ WMS Request {request_id}: Failed with status {response.status_code}")
            return {"request_id": request_id, "duration": duration, "success": False}
            
    except Exception as e:
        end_time = time.time()
        duration = end_time - start_time
        print(f"❌ WMS Request {request_id}: Error after {duration:.2f} seconds: {e}")
        return {"request_id": request_id, "duration": duration, "success": False}

def test_concurrent_wms_requests():
    """Test multiple concurrent WMS requests"""
    print(f"\n🧪 Testing {TEST_REQUESTS} concurrent WMS download requests...")
    print(f"Started at: {time.strftime('%H:%M:%S')}")
    print("=" * 60)
    
    # Start all requests concurrently
    start_time = time.time()
    
    with ThreadPoolExecutor(max_workers=TEST_REQUESTS) as executor:
        # Submit all requests
        futures = [executor.submit(make_wms_request, i+1) for i in range(TEST_REQUESTS)]
        
        # Collect results
        results = []
        for future in as_completed(futures):
            result = future.result()
            results.append(result)
    
    end_time = time.time()
    total_time = end_time - start_time
    
    # Analyze results
    print("=" * 60)
    print(f"📊 WMS THREADING RESULTS:")
    print(f"Total time for {TEST_REQUESTS} WMS requests: {total_time:.2f} seconds")
    
    successful_requests = [r for r in results if r["success"]]
    if successful_requests:
        avg_duration = sum(r["duration"] for r in successful_requests) / len(successful_requests)
        max_duration = max(r["duration"] for r in successful_requests)
        min_duration = min(r["duration"] for r in successful_requests)
        
        print(f"Successful WMS requests: {len(successful_requests)}/{TEST_REQUESTS}")
        print(f"Average WMS request duration: {avg_duration:.2f} seconds")
        print(f"Max WMS request duration: {max_duration:.2f} seconds")
        print(f"Min WMS request duration: {min_duration:.2f} seconds")
        
        # Performance analysis
        if total_time < max_duration * 1.5:
            print("🎉 EXCELLENT: WMS requests ran in parallel! Workers are not blocked.")
        elif total_time < max_duration * 2:
            print("✅ GOOD: Some parallelization achieved for WMS requests.")
        else:
            print("⚠️  POOR: WMS requests appear to be running sequentially.")
    
    print(f"Completed at: {time.strftime('%H:%M:%S')}")

if __name__ == "__main__":
    print("🔧 Testing WMS Image Download Threading Performance Improvement")
    print("This test demonstrates whether WMS downloads are now non-blocking.")
    print()
    
    # Check if Flask server is running
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=5)
        if response.status_code == 200:
            print("✅ Flask server is running")
            test_concurrent_wms_requests()
        else:
            print("❌ Flask server is not responding correctly")
    except Exception as e:
        print(f"❌ Cannot connect to Flask server: {e}")
        print("Please start Flask server first:")
        print("  cd /home/z/my-project/flask_api")
        print("  python app.py")