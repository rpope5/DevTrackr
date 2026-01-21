from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_goal_crud_flow():
    # create
    r = client.post("/goals", json={"title": "Test Goal", "description": "Test"})
    assert r.status_code == 201
    data = r.json()
    goal_id = data["id"]

    # get
    r = client.get(f"/goals/{goal_id}")
    assert r.status_code == 200

    # update
    r = client.put(f"/goals/{goal_id}", json={"title": "Updated Goal"})
    assert r.status_code == 200
    assert r.json()["title"] == "Updated Goal"

    # delete
    r = client.delete(f"/goals/{goal_id}")
    assert r.status_code == 204

    # confirm gone
    r = client.get(f"/goals/{goal_id}")
    assert r.status_code == 404
