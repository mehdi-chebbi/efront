import requests
import json
import base64
import os
from typing import List, Dict, Any, Optional
import logging
from concurrent.futures import ThreadPoolExecutor
import time

logger = logging.getLogger(__name__)

# Thread pool for AI Vision API calls
ai_executor = ThreadPoolExecutor(max_workers=5)

class NemotronVisionAPI:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://openrouter.ai/api/v1/chat/completions"
        self.model = "nvidia/nemotron-nano-12b-v2-vl:free"
        
        # System prompt for satellite data analysis
        self.system_prompt = """You are a satellite imagery analyst specializing in environmental data interpretation. 

Focus exclusively on: satellite images, spectral indices (NDVI, NDWI, EVI), vegetation health, water bodies, geological features, and environmental patterns.

Decline requests outside remote sensing by redirecting to your domain expertise."""

    def encode_image_sync(self, image_path: str) -> str:
        """Synchronous image encoding - runs in thread pool."""
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')

    def encode_image(self, image_path: str) -> str:
        """Encode image file to base64 string using thread pool."""
        try:
            # Submit file I/O to thread pool
            future = ai_executor.submit(self.encode_image_sync, image_path)
            return future.result(timeout=30)  # 30 second timeout
        except Exception as e:
            logger.error(f"Error encoding image {image_path}: {e}")
            raise

    def analyze_image(self, image_path: str, message: str = "Analyze this satellite image") -> Dict[str, Any]:
        """
        Analyze a single image with the vision model.
        
        Args:
            image_path: Path to the image file
            message: Text prompt to send with the image
            
        Returns:
            Dictionary containing the analysis result
        """
        try:
            # Encode image
            image_data = self.encode_image(image_path)
            
            # Prepare content
            content = [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{image_data}"
                    }
                },
                {
                    "type": "text",
                    "text": message
                }
            ]
            
            return self._make_api_call(content)
            
        except Exception as e:
            logger.error(f"Error analyzing image: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    def chat_with_images(self, message: str, image_paths: List[str] = None) -> Dict[str, Any]:
        """
        Send a text message with optional images to the vision model.
        
        Args:
            message: Text message to send
            image_paths: List of image file paths to include
            
        Returns:
            Dictionary containing the chat response
        """
        try:
            content = []
            
            # Add images if provided
            if image_paths:
                for image_path in image_paths:
                    try:
                        image_data = self.encode_image(image_path)
                        content.append({
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_data}"
                            }
                        })
                    except Exception as e:
                        logger.error(f"Failed to encode image {image_path}: {e}")
                        continue
            
            # Add text message
            content.append({
                "type": "text",
                "text": message
            })
            
            return self._make_api_call(content)
            
        except Exception as e:
            logger.error(f"Error in chat with images: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    def simple_chat(self, message: str) -> Dict[str, Any]:
        """
        Send a simple text message to the vision model.
        
        Args:
            message: Text message to send
            
        Returns:
            Dictionary containing the response
        """
        try:
            content = [
                {
                    "type": "text",
                    "text": message
                }
            ]
            
            return self._make_api_call(content)
            
        except Exception as e:
            logger.error(f"Error in simple chat: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    def simple_chat_stream_sync(self, message: str):
        """Synchronous streaming chat - runs in thread pool."""
        try:
            content = [
                {
                    "type": "text",
                    "text": message
                }
            ]
            
            # Make streaming API call
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": self.model,
                "messages": [
                    {
                        "role": "system",
                        "content": self.system_prompt
                    },
                    {
                        "role": "user",
                        "content": content
                    }
                ],
                "stream": True
            }
            
            logger.info(f"Making blocking streaming chat API call to {self.model}")
            
            response = requests.post(
                self.base_url,
                headers=headers,
                json=data,
                stream=True,
                timeout=60
            )
            
            if response.status_code == 200:
                for line in response.iter_lines():
                    if line:
                        line_str = line.decode('utf-8')
                        if line_str.startswith('data: '):
                            data_str = line_str[6:]  # Remove 'data: ' prefix
                            if data_str.strip() == '[DONE]':
                                break
                            try:
                                chunk_data = json.loads(data_str)
                                if 'choices' in chunk_data and len(chunk_data['choices']) > 0:
                                    delta = chunk_data['choices'][0].get('delta', {})
                                    if 'content' in delta:
                                        yield delta['content']
                            except json.JSONDecodeError:
                                continue
                logger.info("Blocking streaming chat API call completed successfully")
            else:
                error_msg = f"API Error: {response.status_code} - {response.text}"
                logger.error(error_msg)
                yield f"Error: {error_msg}"
                
        except requests.exceptions.Timeout:
            error_msg = "Request timed out after 60 seconds"
            logger.error(error_msg)
            yield f"Error: {error_msg}"
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            logger.error(error_msg)
            yield f"Error: {error_msg}"

    def simple_chat_stream(self, message: str):
        """
        Send a simple text message to the vision model with streaming response.
        
        Args:
            message: Text message to send
            
        Yields:
            String chunks of the AI response
        """
        try:
            start_time = time.time()
            logger.info(f"🤖 Starting threaded streaming chat to {self.model}")
            
            # Submit blocking streaming to thread pool
            def run_streaming():
                # Yield directly from sync method to maintain streaming
                yield from self.simple_chat_stream_sync(message)
            
            future = ai_executor.submit(run_streaming)
            
            # Yield from the threaded generator
            yield from future.result(timeout=120)  # 2 minute timeout
            
            end_time = time.time()
            duration = end_time - start_time
            logger.info(f"✅ Threaded streaming chat completed in {duration:.2f} seconds")
                
        except Exception as e:
            end_time = time.time()
            duration = end_time - start_time
            logger.error(f"❌ Threaded streaming chat failed after {duration:.2f} seconds: {e}")
            yield f"Error: Threading error - {str(e)}"

    def _make_api_call_sync(self, content: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Synchronous API call - runs in thread pool."""
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": self.model,
                "messages": [
                    {
                        "role": "system",
                        "content": self.system_prompt
                    },
                    {
                        "role": "user",
                        "content": content
                    }
                ]
            }
            
            logger.info(f"Making blocking API call to {self.model}")
            
            response = requests.post(
                self.base_url,
                headers=headers,
                json=data,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                assistant_message = result['choices'][0]['message']['content']
                
                logger.info("Blocking API call successful")
                
                return {
                    "success": True,
                    "response": assistant_message,
                    "model": self.model,
                    "usage": result.get('usage', {})
                }
            else:
                error_msg = f"API Error: {response.status_code} - {response.text}"
                logger.error(error_msg)
                return {
                    "success": False,
                    "error": error_msg
                }
                
        except requests.exceptions.Timeout:
            error_msg = "Request timed out after 60 seconds"
            logger.error(error_msg)
            return {
                "success": False,
                "error": error_msg
            }
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            logger.error(error_msg)
            return {
                "success": False,
                "error": error_msg
            }

    def _make_api_call(self, content: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Make the actual API call to OpenRouter using thread pool."""
        try:
            start_time = time.time()
            logger.info(f"🤖 Starting threaded AI API call to {self.model}")
            
            # Submit blocking HTTP request to thread pool
            future = ai_executor.submit(self._make_api_call_sync, content)
            result = future.result(timeout=120)  # 2 minute timeout for thread + request
            
            end_time = time.time()
            duration = end_time - start_time
            logger.info(f"✅ Threaded AI API call completed in {duration:.2f} seconds")
            
            return result
            
        except Exception as e:
            end_time = time.time()
            duration = end_time - start_time
            logger.error(f"❌ Threaded AI API call failed after {duration:.2f} seconds: {e}")
            return {
                "success": False,
                "error": f"Threading error: {str(e)}"
            }

    def analyze_image_stream(self, image_path: str, message: str = "Analyze this satellite image"):
        """
        Analyze an image with streaming response.
        
        Args:
            image_path: Path to the image file
            message: Text prompt to send with the image
            
        Yields:
            String chunks of the AI response
        """
        try:
            # Encode image
            image_data = self.encode_image(image_path)
            
            # Prepare content
            content = [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{image_data}"
                    }
                },
                {
                    "type": "text",
                    "text": message
                }
            ]
            
            # Make streaming API call
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": self.model,
                "messages": [
                    {
                        "role": "system",
                        "content": self.system_prompt
                    },
                    {
                        "role": "user",
                        "content": content
                    }
                ],
                "stream": True
            }
            
            logger.info(f"Making streaming API call to {self.model}")
            
            response = requests.post(
                self.base_url,
                headers=headers,
                json=data,
                stream=True,
                timeout=60
            )
            
            if response.status_code == 200:
                for line in response.iter_lines():
                    if line:
                        line_str = line.decode('utf-8')
                        if line_str.startswith('data: '):
                            data_str = line_str[6:]  # Remove 'data: ' prefix
                            if data_str.strip() == '[DONE]':
                                break
                            try:
                                chunk_data = json.loads(data_str)
                                if 'choices' in chunk_data and len(chunk_data['choices']) > 0:
                                    delta = chunk_data['choices'][0].get('delta', {})
                                    if 'content' in delta:
                                        yield delta['content']
                            except json.JSONDecodeError:
                                continue
                logger.info("Streaming API call completed successfully")
            else:
                error_msg = f"API Error: {response.status_code} - {response.text}"
                logger.error(error_msg)
                yield f"Error: {error_msg}"
                
        except requests.exceptions.Timeout:
            error_msg = "Request timed out after 60 seconds"
            logger.error(error_msg)
            yield f"Error: {error_msg}"
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            logger.error(error_msg)
            yield f"Error: {error_msg}"

    def chat_with_images_stream(self, message: str, image_paths: List[str]):
        """
        Send a message with images to the vision model with streaming response.
        
        Args:
            message: Text message to send
            image_paths: List of image file paths to include
            
        Yields:
            String chunks of the AI response
        """
        try:
            content = []
            
            # Add images
            for image_path in image_paths:
                try:
                    image_data = self.encode_image(image_path)
                    content.append({
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_data}"
                        }
                    })
                except Exception as e:
                    logger.error(f"Failed to encode image {image_path}: {e}")
                    continue
            
            # Add text message
            content.append({
                "type": "text",
                "text": message
            })
            
            # Make streaming API call
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": self.model,
                "messages": [
                    {
                        "role": "system",
                        "content": self.system_prompt
                    },
                    {
                        "role": "user",
                        "content": content
                    }
                ],
                "stream": True
            }
            
            logger.info(f"Making streaming API call to {self.model} with {len(image_paths)} images")
            
            response = requests.post(
                self.base_url,
                headers=headers,
                json=data,
                stream=True,
                timeout=60
            )
            
            if response.status_code == 200:
                for line in response.iter_lines():
                    if line:
                        line_str = line.decode('utf-8')
                        if line_str.startswith('data: '):
                            data_str = line_str[6:]  # Remove 'data: ' prefix
                            if data_str.strip() == '[DONE]':
                                break
                            try:
                                chunk_data = json.loads(data_str)
                                if 'choices' in chunk_data and len(chunk_data['choices']) > 0:
                                    delta = chunk_data['choices'][0].get('delta', {})
                                    if 'content' in delta:
                                        yield delta['content']
                            except json.JSONDecodeError:
                                continue
                logger.info("Streaming API call with images completed successfully")
            else:
                error_msg = f"API Error: {response.status_code} - {response.text}"
                logger.error(error_msg)
                yield f"Error: {error_msg}"
                
        except requests.exceptions.Timeout:
            error_msg = "Request timed out after 60 seconds"
            logger.error(error_msg)
            yield f"Error: {error_msg}"
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            logger.error(error_msg)
            yield f"Error: {error_msg}"

    def analyze_image_stream_sync(self, image_path: str, message: str = "Analyze this satellite image"):
        """Synchronous image streaming - runs in thread pool."""
        try:
            # Encode image
            image_data = self.encode_image_sync(image_path)
            
            # Prepare content
            content = [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{image_data}"
                    }
                },
                {
                    "type": "text",
                    "text": message
                }
            ]
            
            # Make streaming API call
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": self.model,
                "messages": [
                    {
                        "role": "system",
                        "content": self.system_prompt
                    },
                    {
                        "role": "user",
                        "content": content
                    }
                ],
                "stream": True
            }
            
            logger.info(f"Making blocking image streaming API call to {self.model}")
            
            response = requests.post(
                self.base_url,
                headers=headers,
                json=data,
                stream=True,
                timeout=60
            )
            
            if response.status_code == 200:
                for line in response.iter_lines():
                    if line:
                        line_str = line.decode('utf-8')
                        if line_str.startswith('data: '):
                            data_str = line_str[6:]  # Remove 'data: ' prefix
                            if data_str.strip() == '[DONE]':
                                break
                            try:
                                chunk_data = json.loads(data_str)
                                if 'choices' in chunk_data and len(chunk_data['choices']) > 0:
                                    delta = chunk_data['choices'][0].get('delta', {})
                                    if 'content' in delta:
                                        yield delta['content']
                            except json.JSONDecodeError:
                                continue
                logger.info("Blocking image streaming API call completed successfully")
            else:
                error_msg = f"API Error: {response.status_code} - {response.text}"
                logger.error(error_msg)
                yield f"Error: {error_msg}"
                
        except requests.exceptions.Timeout:
            error_msg = "Request timed out after 60 seconds"
            logger.error(error_msg)
            yield f"Error: {error_msg}"
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            logger.error(error_msg)
            yield f"Error: {error_msg}"

    def analyze_image_stream(self, image_path: str, message: str = "Analyze this satellite image"):
        """
        Analyze an image with streaming response using thread pool.
        
        Args:
            image_path: Path to image file
            message: Text prompt to send with the image
            
        Yields:
            String chunks of the AI response
        """
        try:
            start_time = time.time()
            logger.info(f"🤖 Starting threaded image streaming analysis")
            
            # Submit blocking streaming to thread pool
            def run_image_streaming():
                # Yield directly from sync method to maintain streaming
                yield from self.analyze_image_stream_sync(image_path, message)
            
            future = ai_executor.submit(run_image_streaming)
            
            # Yield from the threaded generator
            yield from future.result(timeout=120)  # 2 minute timeout
            
            end_time = time.time()
            duration = end_time - start_time
            logger.info(f"✅ Threaded image streaming completed in {duration:.2f} seconds")
                
        except Exception as e:
            end_time = time.time()
            duration = end_time - start_time
            logger.error(f"❌ Threaded image streaming failed after {duration:.2f} seconds: {e}")
            yield f"Error: Threading error - {str(e)}"

    def chat_with_images_stream_sync(self, message: str, image_paths: List[str]):
        """Synchronous multi-image streaming - runs in thread pool."""
        try:
            content = []
            
            # Add images
            for image_path in image_paths:
                try:
                    image_data = self.encode_image_sync(image_path)
                    content.append({
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_data}"
                        }
                    })
                except Exception as e:
                    logger.error(f"Failed to encode image {image_path}: {e}")
                    continue
            
            # Add text message
            content.append({
                "type": "text",
                "text": message
            })
            
            # Make streaming API call
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": self.model,
                "messages": [
                    {
                        "role": "system",
                        "content": self.system_prompt
                    },
                    {
                        "role": "user",
                        "content": content
                    }
                ],
                "stream": True
            }
            
            logger.info(f"Making blocking multi-image streaming API call to {self.model} with {len(image_paths)} images")
            
            response = requests.post(
                self.base_url,
                headers=headers,
                json=data,
                stream=True,
                timeout=60
            )
            
            if response.status_code == 200:
                for line in response.iter_lines():
                    if line:
                        line_str = line.decode('utf-8')
                        if line_str.startswith('data: '):
                            data_str = line_str[6:]  # Remove 'data: ' prefix
                            if data_str.strip() == '[DONE]':
                                break
                            try:
                                chunk_data = json.loads(data_str)
                                if 'choices' in chunk_data and len(chunk_data['choices']) > 0:
                                    delta = chunk_data['choices'][0].get('delta', {})
                                    if 'content' in delta:
                                        yield delta['content']
                            except json.JSONDecodeError:
                                continue
                logger.info("Blocking multi-image streaming API call completed successfully")
            else:
                error_msg = f"API Error: {response.status_code} - {response.text}"
                logger.error(error_msg)
                yield f"Error: {error_msg}"
                
        except requests.exceptions.Timeout:
            error_msg = "Request timed out after 60 seconds"
            logger.error(error_msg)
            yield f"Error: {error_msg}"
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            logger.error(error_msg)
            yield f"Error: {error_msg}"

    def chat_with_images_stream(self, message: str, image_paths: List[str]):
        """
        Send a message with images to the vision model with streaming response using thread pool.
        
        Args:
            message: Text message to send
            image_paths: List of image file paths to include
            
        Yields:
            String chunks of the AI response
        """
        try:
            start_time = time.time()
            logger.info(f"🤖 Starting threaded multi-image streaming with {len(image_paths)} images")
            
            # Submit blocking streaming to thread pool
            def run_multi_image_streaming():
                # Yield directly from sync method to maintain streaming
                yield from self.chat_with_images_stream_sync(message, image_paths)
            
            future = ai_executor.submit(run_multi_image_streaming)
            
            # Yield from the threaded generator
            yield from future.result(timeout=120)  # 2 minute timeout
            
            end_time = time.time()
            duration = end_time - start_time
            logger.info(f"✅ Threaded multi-image streaming completed in {duration:.2f} seconds")
                
        except Exception as e:
            end_time = time.time()
            duration = end_time - start_time
            logger.error(f"❌ Threaded multi-image streaming failed after {duration:.2f} seconds: {e}")
            yield f"Error: Threading error - {str(e)}"

# Global instance (will be initialized with API key)
vision_api: Optional[NemotronVisionAPI] = None

def initialize_vision_api(api_key: str):
    """Initialize the global vision API instance."""
    global vision_api
    vision_api = NemotronVisionAPI(api_key)
    logger.info("Vision API initialized successfully")

def get_vision_api() -> Optional[NemotronVisionAPI]:
    """Get the global vision API instance."""
    return vision_api