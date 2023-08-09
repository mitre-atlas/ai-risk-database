
from airdb.repos.scanners.huggingface import HuggingFaceRepoScanner
from airdb.repos.scanners.pytorch import PytorchRepoScanner
from airdb.utils.huggingface_purl import purl2repo


def test_hf_scanner():
    """Test the CSV handler."""
    handler = HuggingFaceRepoScanner()

    assert not handler.can_handle(
        "asdpfoasdfa.asdfasdf"
    ), "handler should not handle this file"
    assert handler.can_handle(
        "pkg:huggingface/transformers"
    ), "handler should handle this file"

    assert purl2repo("pkg:huggingface/simple_with_no_commithash") == (
        "simple_with_no_commithash",
        None,
        "https://huggingface.co",
    )

    assert purl2repo(
        "pkg:huggingface/distilbert-base-uncased@043235d6088ecd3dd5fb5ca3592b6913fd516027"
    ) == (
        "distilbert-base-uncased",
        "043235d6088ecd3dd5fb5ca3592b6913fd516027",
        "https://huggingface.co",
    )

    assert purl2repo(
        "pkg:huggingface/microsoft/deberta-v3-base@559062ad13d311b87b2c455e67dcd5f1c8f65111?repository_url=https://hub-ci.huggingface.co"
    ) == (
        "microsoft/deberta-v3-base",
        "559062ad13d311b87b2c455e67dcd5f1c8f65111",
        "https://hub-ci.huggingface.co",
    )

    #
    #


def test_pytorch_scanner():
    """Test the CSV handler."""
    handler = PytorchRepoScanner()

    assert not handler.can_handle(
        "asdpfoasdfa.asdfasdf"
    ), "handler should not handle this file"
    assert handler.can_handle("pkg:github")

    # TODO:
    # let's make sure the discovery finds these known URLs
    # this test can also help in regression testing due to breaking changes
    # in the pytorch hub
    known_repos = [
        "pytorch/vision",
        "snakers4/silero-models",
        "ultralytics/yolov5",
        "facebookresearch/WSL-Images",
        "facebookresearch/pytorch_GAN_zoo",
        "facebookresearch/pytorchvideo",
        "facebookresearch/semi-supervised-ImageNet1K-models",
        "huggingface/pytorch-transformers",
        "nvidia/deeplearningexamples",
        "intel-isl/MiDaS",
        "datvuthanh/HybridNets",
        "hustvl/YOLOP",
    ]
