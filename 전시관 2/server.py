# -*- coding: utf-8 -*-
"""
인덕대학교 졸업 작품 전시회 — 메인 가상 미술관 로컬 서버
 - WebGL 텍스처 / ES 모듈은 file:// 에서 동작하지 않으므로 반드시 http 로 실행해야 합니다.
 - 서버 루트는 이 폴더입니다. (전시장에 필요한 파일은 모두 이 폴더 안에 있음)
 - 비디오 탐색/반복 재생을 위해 HTTP Range 요청을 지원합니다.
"""
import http.server
import os
import re
import socketserver
import sys
import urllib.parse
import webbrowser

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = HERE
START = "/index.html"


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript",
        ".mjs": "text/javascript",
        ".css": "text/css",
        ".html": "text/html; charset=utf-8",
        ".json": "application/json",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".mp4": "video/mp4",
        ".mp3": "audio/mpeg",
        ".pdf": "application/pdf",
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def log_message(self, fmt, *args):
        pass

    def end_headers(self):
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def send_head(self):
        rng = self.headers.get("Range")
        path = self.translate_path(self.path)
        if not rng or not os.path.isfile(path):
            return super().send_head()
        m = re.match(r"bytes=(\d*)-(\d*)", rng)
        size = os.path.getsize(path)
        start = int(m.group(1)) if m and m.group(1) else 0
        end = int(m.group(2)) if m and m.group(2) else size - 1
        end = min(end, size - 1)
        if start > end:
            self.send_error(416)
            return None
        f = open(path, "rb")
        f.seek(start)
        self.send_response(206)
        self.send_header("Content-Type", self.guess_type(path))
        self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.send_header("Content-Length", str(end - start + 1))
        self.end_headers()
        self._remaining = end - start + 1
        return f

    def copyfile(self, source, outputfile):
        remaining = getattr(self, "_remaining", None)
        if remaining is None:
            return super().copyfile(source, outputfile)
        try:
            while remaining > 0:
                chunk = source.read(min(64 * 1024, remaining))
                if not chunk:
                    break
                outputfile.write(chunk)
                remaining -= len(chunk)
        except (ConnectionResetError, BrokenPipeError, ConnectionAbortedError):
            pass
        finally:
            self._remaining = None


class Server(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


if __name__ == "__main__":
    url = f"http://localhost:{PORT}{START}"
    with Server(("", PORT), Handler) as httpd:
        print("=" * 60)
        print(" INDUK GRADUATION EXHIBITION 2026  |  가상 미술관")
        print(f" 브라우저에서 열기: {url}")
        print(" 종료: 이 창을 닫거나 Ctrl+C")
        print("=" * 60)
        if "--no-open" not in sys.argv:
            webbrowser.open(url)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
