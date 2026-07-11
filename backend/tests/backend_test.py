"""Backend API tests for Ranthambore's Curator
Covers: bookings, inquiries, admin auth, stats, live-feed, status updates.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://padam-talao-bookings.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"
ADMIN_PIN = "73921846"
ADMIN_HEADERS = {"X-Admin-Pin": ADMIN_PIN, "Content-Type": "application/json"}


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def created_booking_ref(session):
    payload = {
        "date": "2026-02-15",
        "shift": "morning",
        "vehicle": "Gypsy",
        "zone": "3",
        "nationality": "Indian",
        "guests": 3,
        "per_person": 2500,
        "total": 9900,
        "addons": ["chambal"],
        "full_name": "TEST_BookingUser",
        "email": "test_booking@example.com",
        "whatsapp": "+919999999999",
        "age": 30,
        "id_proof_type": "Aadhaar",
        "id_proof_number": "1234-5678-9012",
        "is_tatkal": False,
    }
    r = session.post(f"{API}/bookings", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["ref"].startswith("RTC-2026-")
    assert data["status"] == "pending"
    assert data["total"] == 9900
    return data["ref"]


# ---- Root / Health ----
def test_root(session):
    r = session.get(f"{API}/")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


# ---- Booking creation ----
def test_create_booking(created_booking_ref):
    assert created_booking_ref.startswith("RTC-2026-")


# ---- Admin auth ----
def test_admin_login_correct(session):
    r = session.post(f"{API}/admin/login", json={"pin": ADMIN_PIN})
    assert r.status_code == 200
    assert r.json().get("ok") is True


def test_admin_login_wrong(session):
    r = session.post(f"{API}/admin/login", json={"pin": "00000000"})
    assert r.status_code == 401


def test_admin_stats_unauth(session):
    r = requests.get(f"{API}/admin/stats")
    assert r.status_code == 401


def test_admin_stats_authorized(session):
    r = requests.get(f"{API}/admin/stats", headers=ADMIN_HEADERS)
    assert r.status_code == 200
    data = r.json()
    for k in ["total_bookings", "pending", "confirmed", "cancelled", "revenue", "contact_inquiries", "callback_requests", "package_inquiries"]:
        assert k in data, f"missing key: {k}"


# ---- Admin bookings list & booking appears ----
def test_admin_list_bookings_contains_created(created_booking_ref):
    r = requests.get(f"{API}/admin/bookings", headers=ADMIN_HEADERS)
    assert r.status_code == 200
    bookings = r.json()
    refs = [b["ref"] for b in bookings]
    assert created_booking_ref in refs


# ---- Status update ----
def test_update_booking_status_confirm(created_booking_ref):
    r = requests.patch(f"{API}/admin/bookings/{created_booking_ref}/status", json={"status": "confirmed"}, headers=ADMIN_HEADERS)
    assert r.status_code == 200
    # verify
    r2 = requests.get(f"{API}/admin/bookings", headers=ADMIN_HEADERS)
    booking = next((b for b in r2.json() if b["ref"] == created_booking_ref), None)
    assert booking and booking["status"] == "confirmed"


def test_update_booking_status_unauth(created_booking_ref):
    r = requests.patch(f"{API}/admin/bookings/{created_booking_ref}/status", json={"status": "cancelled"})
    assert r.status_code == 401


def test_update_booking_status_notfound():
    r = requests.patch(f"{API}/admin/bookings/RTC-2026-00000/status", json={"status": "confirmed"}, headers=ADMIN_HEADERS)
    assert r.status_code == 404


# ---- Inquiries ----
@pytest.mark.parametrize("inq_type,name", [
    ("callback", "TEST_CallbackUser"),
    ("contact", "TEST_ContactUser"),
    ("hotel", "TEST_HotelUser"),
    ("package", "TEST_PackageUser"),
    ("custom_package", "TEST_CustomPkgUser"),
    ("tatkal_request", "TEST_TatkalUser"),
])
def test_create_inquiry_types(session, inq_type, name):
    payload = {
        "type": inq_type,
        "name": name,
        "phone": "+919999000011",
        "email": "test_inq@example.com",
        "message": f"test {inq_type}",
        "context": {"summary": f"test {inq_type}"},
    }
    r = session.post(f"{API}/inquiries", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["type"] == inq_type
    assert data["name"] == name


def test_admin_inquiries_list(session):
    r = requests.get(f"{API}/admin/inquiries", headers=ADMIN_HEADERS)
    assert r.status_code == 200
    inquiries = r.json()
    names = [i["name"] for i in inquiries]
    assert "TEST_CallbackUser" in names
    assert "TEST_ContactUser" in names


def test_inquiries_unauth():
    r = requests.get(f"{API}/admin/inquiries")
    assert r.status_code == 401


# ---- Live feed ----
def test_live_feed(session):
    r = requests.get(f"{API}/admin/live-feed", headers=ADMIN_HEADERS)
    assert r.status_code == 200
    data = r.json()
    assert "items" in data
    assert isinstance(data["items"], list)
    assert len(data["items"]) > 0


def test_live_feed_unauth():
    r = requests.get(f"{API}/admin/live-feed")
    assert r.status_code == 401


# ---- Tatkal booking ----
def test_create_tatkal_booking(session):
    payload = {
        "date": "2026-02-20",
        "shift": "evening",
        "vehicle": "Canter",
        "zone": "5",
        "nationality": "Foreigner",
        "guests": 2,
        "per_person": 5000,
        "total": 10000,
        "addons": [],
        "full_name": "TEST_TatkalBooking",
        "email": "tatkal@example.com",
        "whatsapp": "+919999000022",
        "is_tatkal": True,
    }
    r = session.post(f"{API}/bookings", json=payload)
    assert r.status_code == 200
    assert r.json()["is_tatkal"] is True
