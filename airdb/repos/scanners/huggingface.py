""" Module to crawl huggingface repositories. """
import tempfile
from typing import Any, Dict, Generator, Optional, Set, Tuple

import huggingface_hub
import requests
from dateutil import parser as dateutil_parser
from huggingface_hub.utils import (
    HfHubHTTPError,
    RepositoryNotFoundError,
    disable_progress_bars,
)

from airdb.repos.base_repo_scanner import BaseRepoScanner
from airdb.utils.huggingface_purl import purl2repo, repo2purl

# see https://huggingface.co/tasks
# these globals are unused, but available for further filtering in repo_iter()
CV_TASKS: Tuple[str, ...] = (
    "depth-estimation",
    "image-classification",
    "image-segmentation",
    "image-to-image",
    "object-detection",
    "video-classification",
    "unconditional-image-generation",
    "zero-shot-image-classification",
    "unconditional-image-generation",
)
NLP_TASKS: Tuple[str, ...] = (
    "conversational",
    "fill-mask",
    "question-answering",
    "summarization",
    "sentence-similarity",
    "summarization",
    "table-question-answering",
    "text-classification",
    "text-generation",
    "token-classification",
    "translation",
    "zero-shot-classification",
    "text2text-generation",
)
AUDIO_TASKS: Tuple[str, ...] = (
    "audio-classification",
    "audio-to-audio",
    "automatic-speech-recognition",
    "text-to-speech",
    "voice-activity-detection",
)
TABULAR_TASKS: Tuple[str, ...] = ("tabular-classification", "tabular-regression")
MULTIMODAL_TASKS: Tuple[str, ...] = (
    "document-question-answering",
    "feature-extraction",
    "image-to-text",
    "text-to-image",
    "visual-question-answering",
)
REINFORCEMENT_LEARINING_TASKS: Tuple[str, ...] = ("reinforcement-learning", "robotics")

# see https://huggingface.co/models
LIBRARIES = set(
    (
        "pytorch",
        "tensorflow",
        "jax",
        "transformers",
        "tensorboard",
        "stable-baselines3",
        "diffusers",
        "onnx",
        "ml-agents",
        "keras",
        "timm",
        "espnet",
        "spacy",
        "sample-factory",
        "adapter-transformers",
        "rust",
        "scikit-learn",
        "joblib",
        "nemo",
        "fastai",
        "flair",
        "safetensors",
        "speechbrain",
        "fairseq",
        "graphcore",
        "stanza",
        "paddlepaddle",
        "coreml",
        "paddlenlp",
        "tflite",
        "asteroid",
        "habana",
        "tensorflowtts",
        "allennlp",
        "pythae",
        "pyannote-audio",
        "fasttext",
        "openvino",
    )
)


class HuggingFaceRepoScanner(BaseRepoScanner):
    """HuggingFace Repository Scanner."""

    purls_handled: Tuple[str, ...] = ("pkg:huggingface",)

    def __init__(self) -> None:
        """Initialize the scanner."""
        disable_progress_bars()
        self.tasks = [None]  # don't filter by task
        # self.tasks = (
        #     CV_TASKS
        #     + NLP_TASKS
        #     + AUDIO_TASKS
        #     + TABULAR_TASKS
        #     + MULTIMODAL_TASKS
        #     + REINFORCEMENT_LEARINING_TASKS
        # )

    def set_tasks(self, tasks: Tuple[str, ...]) -> None:
        """Set the tasks to filter on."""
        self.tasks = tasks

    def repo_iter(
        self, skip: Optional[Set[str]] = None, with_latest: bool = True
    ) -> Generator[str, None, None]:
        """Iterate over huggingface repos and yield a purl."""
        limit = None
        # with no filtering, this can take ~3 seconds to get just the basic info
        # _filter = huggingface_hub.ModelFilter()
        # repos = huggingface_hub.list_models(filter=_filter, limit=limit, full=False)

        # _filter = huggingface_hub.ModelFilter(
        #     task="text-classification", library="pytorch"
        # )

        for task in self.tasks:
            print(f"Task: {task}")
            _filter = huggingface_hub.ModelFilter(
                task=task,
            )

            repos = sorted(
                huggingface_hub.list_models(filter=_filter, limit=limit, full=False),
                key=lambda model: getattr(model, "downloads", 0),
                reverse=True,
            )

            # full=True pulls sha, files and tags, but takes ~30 seconds
            for repo in repos:
                # with full=False, we don't get the commit hash, and need to pull separately
                if skip and (repo.id in skip or f"pkg:huggingface/{repo.id}" in skip):
                    print("skipping", repo)
                    continue  # skip this one

                if with_latest:
                    try:
                        # get latest commit info with a call to model_info
                        info = huggingface_hub.model_info(repo.modelId)
                    except (
                        requests.exceptions.ReadTimeout,
                        requests.exceptions.ConnectionError,
                        HfHubHTTPError,
                        RepositoryNotFoundError,
                    ):
                        # this can happen if the repo is deleted between the
                        # list_models() call and the model_info() call
                        continue
                    except KeyboardInterrupt as e:
                        raise e
                    except Exception as e:
                        print(e)
                        continue

                    yield repo2purl(repo.modelId, info.sha)

                else:
                    # no commithash
                    yield repo2purl(repo.modelId)

    def get_repo_info(self, purl: str) -> Dict[str, Any]:
        """Get info about a huggingface repo."""
        reponame, commithash, baseurl = purl2repo(purl)
        if not baseurl:
            baseurl = "https://huggingface.co"
        uri = f"{baseurl}/{reponame}"
        # commithash may be None, in which case we pass through to get the latest
        info = huggingface_hub.model_info(reponame, revision=commithash)
        # get commit date/hash from the huggingface_hub
        commitdate = dateutil_parser.parse(info.lastModified).isoformat()
        commithash = info.sha
        task = info.pipeline_tag
        tags = info.tags
        libraries = list(LIBRARIES.intersection(tags))
        name = reponame.split("/")[-1]
        author = info.author
        likes = info.likes if hasattr(info, "likes") else None
        downloads = info.downloads if hasattr(info, "downloads") else None
        carddata = info.cardData if hasattr(info, "cardData") else {}
        return {  # expecting "type", "uri" and "versions" for all repos
            "type": "huggingface",
            "uri": uri,
            "versions": {
                commithash: commitdate
            },  # this may be updated in future crawls
            "name": name,
            "fullname": reponame,
            "owner": author,
            "reputation": {
                "downloads": downloads,
                "likes": likes,
            },
            "repo_info": {
                "tags": tags,
                "carddata": carddata,
            },
            "task": task,
            "libraries": libraries,
        }
        # ModelInfo: {
        #         modelId: Habana/bert-large-uncased-whole-word-masking
        #         sha: d085d89a37d40f95ff540e3be5e54f2de6130d0d
        #         lastModified: 2022-11-15T22:21:39.000Z
        #         tags: ['optimum_habana', 'license:apache-2.0']
        #         pipeline_tag: None
        #         siblings: [RepoFile(rfilename='.gitattributes', size='None', blob_id='None', lfs='None'), RepoFile(rfilename='README.md', size='None', blob_id='None', lfs='None'), RepoFile(rfilename='gaudi_config.json', size='None', blob_id='None', lfs='None')]
        #         private: False
        #         author: Habana
        #         config: None
        #         securityStatus: None
        #         _id: 6262ee2d3662a749162cb664
        #         id: Habana/bert-large-uncased-whole-word-masking
        #         disabled: False
        #         gated: False
        #         downloads: 790
        #         likes: 0
        #         model-index: None
        #         cardData: {'license': 'apache-2.0'}
        #         spaces: []
        # }

    def file_iter(self, purl: str) -> Generator[Tuple[str, str], None, None]:
        """Iterate over files in a huggingface repo and yield a purl and file path."""
        repo, commithash, _ = purl2repo(purl)
        try:
            info = huggingface_hub.model_info(repo)
        except (RepositoryNotFoundError, HfHubHTTPError):
            # this can happen if the repo is deleted between the
            # list_models() call and the model_info() call
            print(f"error getting info for {repo}")
            return

        for repofile in info.siblings:
            filename = repofile.rfilename

            # pull a single file
            with tempfile.TemporaryDirectory() as tmpdirname:
                try:
                    downloaded_path = huggingface_hub.hf_hub_download(
                        repo_id=repo,
                        revision=commithash,
                        filename=filename,
                        cache_dir=tmpdirname,
                    )
                except (
                    requests.exceptions.ReadTimeout,
                    requests.exceptions.ConnectionError,
                    HfHubHTTPError,
                    RepositoryNotFoundError,
                    OSError,
                ) as excp:
                    print(f"error downloading {repo}/{filename}: {excp}")
                    continue

                modeldir = downloaded_path.removesuffix(filename)

                yield modeldir, filename
