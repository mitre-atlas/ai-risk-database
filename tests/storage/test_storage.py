""" Pytests for storage interfaces. """
import tempfile

from airdb.storage.filestorage import LocalFileStorage


def test_filestorage():
    # use a temporary directory
    with tempfile.TemporaryDirectory() as tmpdirname:
        db = LocalFileStorage("test", path=tmpdirname)
        db.set("test", {"test": "test"})
        assert db.get("test") == {"test": "test"}

        db.upsert("test", {"test": "test1", "test2": "test2"})
        assert db.get("test") == {"test": "test1", "test2": "test2"}

        db.set("foo", {"foo": "foo"})
        assert sorted(db.keys()) == sorted(["foo", "test"])

        assert db.exists("test")

        db.delete("test")
        assert db.get("test") == {}

        assert db.exists("test") == False
