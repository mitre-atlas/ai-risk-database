# HuggingFace

## Summary of Tasks as of Nov 21, 2022
From [https://huggingface.co/tasks](https://huggingface.co/tasks), I inferred the following model tasks
```python
cv_tasks = [
    'image-classification', 'image-segmentation', 'image-to-image',
    'object-detection', 'video-classification', 'unconditional-image-generation',
    'zero-shot-image-classification', 'unconditional-image-generation',
]
nlp_tasks = [
    'conversational', 'fill-mask', 'question-answering', 'summarization',
    'sentence-similarity', 'summarization', 'table-question-answering',
    'text-classification', 'text-generation', 'token-classification',
    'translation', 'zero-shot-classification', 'text2text-generation',
]
audio_tasks = [
    'audio-classification', 'audio-to-audio', 'automatic-speech-recognition',
    'text-to-speech', 'voice-activity-detection'
]
tabular_tasks = [
    'tabular-classification', 'tabular-regression'
]
multimodal_tasks = [
    'document-question-answering', 'feature-extraction', 'image-to-text',
    'text-to-image', 'visual-question-answering'
]
reinforcement_learning_tasks = [
    'reinforcement-learning', 'robotics'
]
```

And a simple counting via
```python
from collections import Counter
import tqdm

tags = Counter()
basenames = Counter()
extensions = Counter()

for task in cv_tasks + nlp_tasks + tabular_tasks + audio_tasks:
    print(f'Task: {task}')
    new_filter = ModelFilter(task=task) # , full=True, cardData=True)
    models = list_models(filter=new_filter, limit=500)
    for model in tqdm.tqdm(models):
        tags.update(model.tags)
        basenames.update([e.rfilename.split('/')[-1] for e in model.siblings])

for name, val in basenames.items():
    ext = name.split('.')[-1]
    extensions.update({ext: val})
```

yields (via `.most_common(50)`):
### Tags
```
[('pytorch', 6844), ('transformers', 6717), ('autotrain_compatible', 3486), ('license:apache-2.0', 2941), ('text2text-generation', 1687), ('tf', 1489), ('en', 1342), ('tensorboard', 1198), ('generated_from_trainer', 1187), ('bert', 1153), ('summarization', 1025), ('text-generation', 985), ('jax', 935), ('gpt2', 929), ('translation', 898), ('marian', 875), ('has_space', 845), ('feature-extraction', 793), ('conversational', 779), ('model-index', 673), ('wav2vec2', 651), ('text-classification', 627), ('fill-mask', 519), ('t5', 513), ('automatic-speech-recognition', 510), ('question-answering', 506), ('sentence-similarity', 504), ('token-classification', 503), ('image-classification', 502), ('audio', 479), ('distilbert', 478), ('sentence-transformers', 477), ('roberta', 426), ('license:mit', 408), ('es', 283), ('vision', 268), ('de', 263), ('audio-classification', 243), ('text-to-speech', 230), ('license:cc-by-4.0', 214), ('bart', 208), ('vit', 197), ('fr', 193), ('espnet', 192), ('dataset:wikipedia', 191), ('dataset:squad', 183), ('ar', 182), ('mt5', 180), ('arxiv:1804.00015', 175), ('multilingual', 161)]
```
### Basenames
```
[('config.json', 8001), ('.gitattributes', 7803), ('pytorch_model.bin', 7204), ('README.md', 6696), ('tokenizer_config.json', 5914), ('special_tokens_map.json', 4864), ('tokenizer.json', 3327), ('vocab.json', 3205), ('training_args.bin', 2995), ('merges.txt', 1845), ('vocab.txt', 1721), ('tf_model.h5', 1487), ('.gitignore', 1340), ('preprocessor_config.json', 1301), ('flax_model.msgpack', 946), ('source.spm', 868), ('target.spm', 868), ('spiece.model', 725), ('trainer_state.json', 714), ('eval_results.txt', 687), ('all_results.json', 552), ('train_results.json', 531), ('eval_results.json', 501), ('modules.json', 459), ('sentence_bert_config.json', 459), ('config_sentence_transformers.json', 449), ('scheduler.pt', 432), ('optimizer.pt', 417), ('added_tokens.json', 374), ('config.yaml', 324), ('metadata.json', 266), ('sentencepiece.bpe.model', 239), ('meta.yaml', 189), ('feats_stats.npz', 169), ('iter_time.png', 165), ('train_time.png', 165), ('eval_nbest_predictions.json', 134), ('eval_predictions.json', 134), ('loss.png', 130), ('backward_time.png', 126), ('forward_time.png', 126), ('optim_step_time.png', 126), ('eval.py', 125), ('run_speech_recognition_ctc.py', 121), ('run.sh', 116), ('model.pt', 112), ('rng_state.pth', 106), ('alphabet.json', 100), ('attrs.json', 100), ('unigrams.txt', 100)]
```

### Extensions
```
[('json', 32697), ('bin', 10635), ('gitattributes', 7811), ('md', 6747), ('txt', 5157), ('png', 3035), ('spm', 1736), ('h5', 1517), ('0', 1499), ('1', 1386), ('gitignore', 1340), ('model', 1125), ('pt', 1041), ('msgpack', 949), ('py', 687), ('2', 681), ('jpg', 672), ('yaml', 645), ('pth', 380), ('npz', 322), ('v2', 305), ('fr', 291), ('csv', 276), ('sh', 247), ('3', 233), ('pb', 200), ('ckpt', 170), ('log', 162), ('4', 155), ('5', 123), ('rttm', 111), ('pkl', 88), ('cfg', 85), ('index', 84), ('scp', 84), ('data-00000-of-00001', 81), ('ot', 81), ('6', 75), ('ark', 66), ('ipynb', 60), ('7', 57), ('eval', 51), ('MESHAL-LAMBDA', 50), ('8', 43), ('onnx', 41), ('9', 39), ('DS_Store', 37), ('joblib', 37), ('wandb', 37), ('gz', 32)]
```
