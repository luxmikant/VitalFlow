"""
VitalFlow Extension - Local Development Server
A simple HTTP server with CORS support for testing Tableau Extensions locally.

Usage:
    cd "w:\\tablueau hackathon\\VitalFlow\\src\\extension"
    python server.py

Then access: http://localhost:8765/index.html
"""

import http.server
import socketserver
import os
from urllib.parse import urlparse, parse_qs

PORT = 8765

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP request handler with CORS headers for cross-origin requests."""
    
    def end_headers(self):
        """Add CORS headers to all responses."""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()
    
    def do_OPTIONS(self):
        """Handle preflight CORS requests."""
        self.send_response(200)
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests with better logging."""
        # Parse URL to remove query parameters
        parsed_path = urlparse(self.path)
        clean_path = parsed_path.path
        
        # Check if file exists
        file_path = self.translate_path(clean_path)
        
        if os.path.exists(file_path) and os.path.isfile(file_path):
            print(f"✅ Serving: {clean_path}")
        elif clean_path == '/favicon.ico' or '.well-known' in clean_path:
            # Ignore common browser requests
            pass
        else:
            print(f"❌ 404 Not Found: {clean_path}")
            print(f"   Looking for: {file_path}")
        
        # Call parent method to handle the actual request
        super().do_GET()
    
    def log_message(self, format, *args):
        """Custom log format - suppress default logging."""
        # Only log errors
        if '404' in format or '500' in format:
            print(f"⚠️  {format % args}")
        pass


def run_server():
    """Start the development server."""
    # Change to the extension directory
    extension_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(extension_dir)
    
    print("=" * 50)
    print("🏥 VitalFlow Extension Server")
    print("=" * 50)
    print(f"📂 Serving from: {extension_dir}")
    print(f"🌐 Server URL: http://localhost:{PORT}")
    print(f"📄 Extension URL: http://localhost:{PORT}/index.html")
    print(f"📋 Manifest URL: http://localhost:{PORT}/vitalflow.trex")
    print("=" * 50)
    print("Press Ctrl+C to stop the server")
    print()
    
    with socketserver.TCPServer(("", PORT), CORSRequestHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 Server stopped")


if __name__ == "__main__":
    run_server()
