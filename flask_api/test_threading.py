#!/usr/bin/env python3
"""
Test script to demonstrate the threading performance improvement.
This simulates multiple concurrent requests to show the difference.
"""

import requests
import json
import time
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed

# Test configuration
BASE_URL = "http://localhost:5000"
TEST_REQUESTS = 5  # Number of concurrent requests to test

def make_request(request_id):
    """Make a single time series request"""
    print(f"🚀 Request {request_id}: Starting at {time.strftime('%H:%M:%S')}")
    
    start_time = time.time()
    
    # Sample request data
    test_data = {
        "geometry": [
            [0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0], [0.0, 0.0]
        ],
        "start_date": "2024-01-01",
        "end_date": "2024-01-31",
        "indices": ["NDVI"]
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/time_series",
            json=test_data,
            timeout=300
        )
        
        end_time = time.time()
        duration = end_time - start_time
        
        if response.status_code == 200:
            print(f"✅ Request {request_id}: Completed in {duration:.2f} seconds")
            return {"request_id": request_id, "duration": duration, "success": True}
        else:
            print(f"❌ Request {request_id}: Failed with status {response.status_code}")
            return {"request_id": request_id, "duration": duration, "success": False}
            
    except Exception as e:
        end_time = time.time()
        duration = end_time - start_time
        print(f"❌ Request {request_id}: Error after {duration:.2f} seconds: {e}")
        return {"request_id": request_id, "duration": duration, "success": False}

def test_concurrent_requests():
    """Test multiple concurrent requests"""
    print(f"\n🧪 Testing {TEST_REQUESTS} concurrent requests...")
    print(f"Started at: {time.strftime('%H:%M:%S')}")
    print("=" * 60)
    
    # Start all requests concurrently
    start_time = time.time()
    
    with ThreadPoolExecutor(max_workers=TEST_REQUESTS) as executor:
        # Submit all requests
        futures = [executor.submit(make_request, i+1) for i in range(TEST_REQUESTS)]
        
        # Collect results
        results = []
        for future in as_completed(futures):
            result = future.result()
            results.append(result)
    
    end_time = time.time()
    total_time = end_time - start_time
    
    # Analyze results
    print("=" * 60)
    print(f"📊 RESULTS:")
    print(f"Total time for {TEST_REQUESTS} requests: {total_time:.2f} seconds")
    
    successful_requests = [r for r in results if r["success"]]
    if successful_requests:
        avg_duration = sum(r["duration"] for r in successful_requests) / len(successful_requests)
        max_duration = max(r["duration"] for r in successful_requests)
        min_duration = min(r["duration"] for r in successful_requests)
        
        print(f"Successful requests: {len(successful_requests)}/{TEST_REQUESTS}")
        print(f"Average request duration: {avg_duration:.2f} seconds")
        print(f"Max request duration: {max_duration:.2f} seconds")
        print(f"Min request duration: {min_duration:.2f} seconds")
        
        # Performance analysis
        if total_time < max_duration * 1.5:
            print("🎉 EXCELLENT: Requests ran in parallel! Workers are not blocked.")
        elif total_time < max_duration * 2:
            print("✅ GOOD: Some parallelization achieved.")
        else:
            print("⚠️  POOR: Requests appear to be running sequentially.")
    
    print(f"Completed at: {time.strftime('%H:%M:%S')}")

if __name__ == "__main__":
    print("🔧 Testing Threading Performance Improvement")
    print("This test demonstrates whether the getInfo() call is now non-blocking.")
    print()
    
    # Check if Flask server is running
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=5)
        if response.status_code == 200:
            print("✅ Flask server is running")
            test_concurrent_requests()
        else:
            print("❌ Flask server is not responding correctly")
    except Exception as e:
        print(f"❌ Cannot connect to Flask server: {e}")
        print("Please start the Flask server first:")
        print("  cd /home/z/my-project/flask_api")
        print("  python app.py")