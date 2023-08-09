"""Test file scanning."""
import pickle
import tempfile

import numpy as np

# import tensorflow as tf
import torch

from airdb.sbom.base_handler import BaseFileHandler
from airdb.sbom.formats.csv_handler import CSVHandler
from airdb.sbom.formats.json_handler import JSONHandler
from airdb.sbom.formats.npz_handler import NPZHandler
from airdb.sbom.formats.pickle_handler import PickleHandler
from airdb.sbom.formats.pytorch_handler import PytorchHandler
from airdb.sbom.formats.spm_handler import SPMHandler
from airdb.sbom.formats.tf_handler import TFHandler
from airdb.sbom.formats.txt_handler import TXTHandler


# define a simple torch model
class SimpleModel(torch.nn.Module):
    """Simple model to test serialization."""

    def __init__(self):
        super().__init__()
        self.linear = torch.nn.Linear(1, 1)

    def forward(self, x):
        return self.linear(x)


class ACEPickle(object):
    def __reduce__(self):
        import os

        return (os.system, ('echo "hello world"',))


def test_base_filehandler():
    """Test the base file handler."""
    handler = BaseFileHandler()

    with tempfile.TemporaryDirectory() as tmpdir:
        hello = b"hello"
        with open(tmpdir + "/test.txt", "wb") as f:
            f.write(hello)

        hello_hash = "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
        assert handler.hashfile(tmpdir + "/test.txt") == hello_hash

        assert handler.hashbytes(hello) == hello_hash

        assert not handler.is_binary_file(tmpdir + "/test.txt")

        binary_string = bytes("".join([chr(i) for i in range(256)]), encoding="utf-8")
        with open(tmpdir + "/test.bin", "wb") as f:
            f.write(binary_string)

        assert handler.is_binary_file(tmpdir + "/test.bin")


def test_csv_handler():
    """Test the CSV handler."""
    handler = CSVHandler()

    assert not handler.can_handle(
        "asdpfoasdfa.asdfasdf"
    ), "handler should not handle this file"

    with (
        tempfile.NamedTemporaryFile(
            suffix=".csv", mode="w", encoding="utf-8"
        ) as tmpfile1,
        tempfile.NamedTemporaryFile(
            suffix=".csv", mode="w", encoding="utf-8"
        ) as tmpfile2,
    ):
        tmpfile1.write(
            """#comment
        a,b,c
        3,1,2
        0,1,2"""
        )
        tmpfile2.write(
            """a,b,c
        0,1,2
        3,1,2
        """
        )  # with extra newline

        tmpfile1.flush()
        tmpfile2.flush()

        output1 = handler.handle(tmpfile1.name)
        output2 = handler.handle(tmpfile2.name)

        assert (
            output1["ordered_sha256"] == output2["ordered_sha256"]
        ), "handler should not care about order and extra newline"


def test_txt_handler():
    """Test the CSV handler."""
    handler = TXTHandler()

    assert not handler.can_handle(
        "asdpfoasdfa.asdfasdf"
    ), "handler should not handle this file"

    with (
        tempfile.NamedTemporaryFile(
            suffix=".txt", mode="w", encoding="utf-8"
        ) as tmpfile1,
        tempfile.NamedTemporaryFile(
            suffix=".txt", mode="w", encoding="utf-8"
        ) as tmpfile2,
    ):
        tmpfile1.write(
            """abc
        def
        hij"""
        )
        tmpfile2.write(
            """abc
        hij
        def

        """
        )  # with extra newline

        tmpfile1.flush()
        tmpfile2.flush()

        output1 = handler.handle(tmpfile1.name)
        output2 = handler.handle(tmpfile2.name)

        assert (
            output1["ordered_sha256"] == output2["ordered_sha256"]
        ), "handler should not care about order and extra newline"


def test_json_handler():
    """Test the JSON handler."""
    handler = JSONHandler()

    assert not handler.can_handle(
        "asdpfoasdfa.asdfasdf"
    ), "handler should not handle this file"

    with (
        tempfile.NamedTemporaryFile(
            suffix=".json", mode="w", encoding="utf-8"
        ) as tmpfile1,
        tempfile.NamedTemporaryFile(
            suffix=".json", mode="w", encoding="utf-8"
        ) as tmpfile2,
    ):
        tmpfile1.write('{"a": {"aa": 1, "ab": 2}, "b": {"ba": 3, "bb": 4}}')
        tmpfile2.write('{"b": {"bb": 4, "ba": 3}, "a": {"ab": 2, "aa": 1}}')

        tmpfile1.flush()
        tmpfile2.flush()

        output1 = handler.handle(tmpfile1.name)
        output2 = handler.handle(tmpfile2.name)

        assert (
            output1["ordered_sha256"] == output2["ordered_sha256"]
        ), "handler should not care about order"


# def test_msgpack_handler():
#     """Test the msgpack handler."""
#     handler = MsgpackHandler()

#     assert not handler.can_handle(
#         "asdpfoasdfa.asdfasdf"
#     ), "handler should not handle this file"
#     with (
#         tempfile.NamedTemporaryFile(suffix=".msgpack", mode="wb") as tmpfile1,
#         tempfile.NamedTemporaryFile(suffix=".msgpack", mode="wb") as tmpfile2,
#     ):
#         tmpfile1.write(
#             msgpack.packb(
#                 json.loads('{"a": {"aa": 1, "ab": 2}, "b": {"ba": 3, "bb": 4}}')
#             )
#         )

#         tmpfile2.write(
#             msgpack.packb(
#                 json.loads('{"b": {"bb": 4, "ba": 3}, "a": {"ab": 2, "aa": 1}}')
#             )
#         )

#         tmpfile1.flush()
#         tmpfile2.flush()

#         output1 = handler.handle(tmpfile1.name)
#         output2 = handler.handle(tmpfile2.name)

#         assert (
#             output1["ordered_sha256"] == output2["ordered_sha256"]
#         ), "handler should not care about order"


def test_npz_handler():
    """Test the npz handler."""
    handler = NPZHandler()

    assert not handler.can_handle(
        "asdpfoasdfa.asdfasdf"
    ), "handler should not handle this file"

    with tempfile.NamedTemporaryFile(suffix=".npy", mode="wb") as tmpfile:
        bad_pickle = ACEPickle()
        pickle.dump(bad_pickle, tmpfile)
        tmpfile.flush()

        assert handler.can_handle(tmpfile.name), "handler should handle this file"
        output = handler.handle(tmpfile.name)

        # assert output["uses_pickle"], "handler should detect pickle"
        assert output["module_info"] == {
            "posix": ["system"]
        }, "handler should detect module"

    with tempfile.NamedTemporaryFile(suffix=".npy", mode="wb") as tmpfile:
        npy = np.zeros((2, 2))
        np.save(tmpfile, npy, allow_pickle=False)
        tmpfile.flush()

        assert handler.can_handle(tmpfile.name), "handler should handle this file"
        output = handler.handle(tmpfile.name)

        # assert output["uses_pickle"] == False, "handler should not detect pickle"
        assert output["module_info"] == {}, "handler should detect no modules"

    with tempfile.NamedTemporaryFile(suffix=".npz", mode="wb") as tmpfile:
        bad_pickle = ACEPickle()
        pickle.dump(bad_pickle, tmpfile)
        tmpfile.flush()

        assert handler.can_handle(tmpfile.name), "handler should handle this file"
        output = handler.handle(tmpfile.name)

        # assert output["uses_pickle"], "handler should detect pickle"
        assert output["module_info"] == {
            "posix": ["system"]
        }, "handler should detect module"

    with tempfile.NamedTemporaryFile(suffix=".npz", mode="wb") as tmpfile:
        npz = np.zeros((2, 2))
        np.savez(tmpfile, npz, allow_pickle=False)
        tmpfile.flush()

        assert handler.can_handle(tmpfile.name), "handler should handle this file"
        output = handler.handle(tmpfile.name)

        # assert output["uses_pickle"] == False, "handler should not detect pickle"
        assert output["module_info"] == {}, "handler should detect no modules"

    # with tempfile.NamedTemporaryFile(suffix=".npz", mode="wb") as tmpfile:
    #     tmpfile.write(b"garbage...not a real file")
    #     tmpfile.flush()

    #     assert handler.can_handle(
    #         tmpfile.name
    #     ), "handler thinks it should handle this file"
    #     output = handler.handle(tmpfile.name)

    #     assert (
    #         output.get("error", "") == "[npz] invalid numpy file (UnpicklingError)"
    #     ), "handler should detect bad numpy"


def test_pickle_handler():
    """Test the npz handler."""
    handler = PickleHandler()

    assert not handler.can_handle(
        "asdpfoasdfa.asdfasdf"
    ), "handler should not handle this file"
    with tempfile.NamedTemporaryFile(suffix=".pkl", mode="wb") as tmpfile:
        bad_pickle = ACEPickle()
        pickle.dump(bad_pickle, tmpfile)
        tmpfile.flush()

        assert handler.can_handle(tmpfile.name), "handler should handle this file"
        output = handler.handle(tmpfile.name)

        assert output["module_info"] == {
            "posix": ["system"]
        }, "handler should detect module"

    # with tempfile.NamedTemporaryFile(suffix=".pkl", mode="wb") as tmpfile:
    #     tmpfile.write(b"garbage...not a real file")
    #     tmpfile.flush()

    #     assert handler.can_handle(
    #         tmpfile.name
    #     ), "handler thinks it should handle this file"
    #     output = handler.handle(tmpfile.name)

    #     assert (
    #         output.get("error", "") == "[pickle] invalid pickle file (UnpicklingError)"
    #     ), "handler should detect bad pickle"


def test_pytorch_handler():
    """Test the npz handler."""
    handler = PytorchHandler()

    assert not handler.can_handle(
        "asdpfoasdfa.asdfasdf"
    ), "handler should not handle this file"
    with tempfile.NamedTemporaryFile(suffix=".pt", mode="wb") as tmpfile:
        model = SimpleModel()
        torch.save(model, tmpfile)
        tmpfile.flush()

        assert handler.can_handle(tmpfile.name), "handler should handle this file"
        output = handler.handle(tmpfile.name)

        assert output["module_info"] == {
            "__builtin__": ["set"],
            "collections": ["OrderedDict"],
            "tests.sbom.test_filescanning": ["SimpleModel"],
            "torch._utils": ["_rebuild_parameter", "_rebuild_tensor_v2"],
            "torch.nn.modules.linear": ["Linear"],
        }, "handler should detect modules"

    # with tempfile.NamedTemporaryFile(suffix=".pt", mode="wb") as tmpfile:
    #     tmpfile.write(b"garbage...not a real file")
    #     tmpfile.flush()

    #     assert handler.can_handle(
    #         tmpfile.name
    #     ), "handler thinks it should handle this file"
    #     output = handler.handle(tmpfile.name)

    #     assert (
    #         output.get("error", "")
    #         == "[pytorch] invalid pytorch file (UnpicklingError)"
    #     ), "handler should detect bad pytorch"


def test_spm_handler():
    """Test the npz handler."""
    handler = SPMHandler()

    assert not handler.can_handle(
        "asdpfoasdfa.asdfasdf"
    ), "handler should not handle this file"
    # TODO


def test_tensorflow_handler():
    """Test the npz handler."""
    handler = TFHandler()

    assert not handler.can_handle(
        "asdpfoasdfa.asdfasdf"
    ), "handler should not handle this file"

    # more tests here:
    # https://splint.gitbook.io/cyberblog/security-research/tensorflow-remote-code-execution-with-malicious-model
    # def exploit(x):
    #     import os

    #     os.system("touch /tmp/pwned")
    #     return x

    # model = tf.keras.Sequential()
    # model.add(tf.keras.layers.Input(shape=(64,)))
    # model.add(tf.keras.layers.Lambda(exploit))
    # model.compile()

    # new_model = tf.keras.models.load_model("./bin/keras_layer.h5")

    # with tempfile.NamedTemporaryFile(suffix='.h5', mode="wb") as tmpfile:
    #     model.save(tmpfile)
    #     tmpfile.flush()

    #     assert handler.can_handle(tmpfile.name), "handler should handle this file"
    #     output = handler.handle(tmpfile.name)

    #     # TODO
    #     # assert output["module_info"] == {
    #     #     'tensorflow.python.keras.engine.sequential': ['Sequential'],
    #     #     'tensorflow.python.keras.layers.core': ['Lambda'],
    #     #     'tensorflow.python.keras.layers.core': ['Input'],
    #     #     'tensorflow.python.keras.saving.save': ['load_model']
    #     #     }, "handler should detect modules"
