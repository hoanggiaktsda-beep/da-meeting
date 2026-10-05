import os
import tempfile
import unittest
from pathlib import Path
from fastapi.testclient import TestClient
import app

class MeetingApiTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        app.DB = Path(self.temp.name) / "db.sqlite3"
        self.client = TestClient(app.app)

    def tearDown(self):
        self.temp.cleanup()

    def test_create_and_list(self):
        self.assertEqual(self.client.get("/api/v1/meetings").json(), [])
        created = self.client.post("/api/v1/meetings", json={"title": "Họp showroom", "department": "Thiết kế"})
        self.assertEqual(created.status_code, 201)
        self.assertEqual(self.client.get("/api/v1/meetings").json()[0]["title"], "Họp showroom")

    def test_blank_title_rejected(self):
        self.assertEqual(self.client.post("/api/v1/meetings", json={"title": "  "}).status_code, 422)

if __name__ == "__main__":
    unittest.main()
