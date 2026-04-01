# GPT-SoVITS on Unraid

This deployment path is a better fit than Fish Speech on a GTX 1070 because GPT-SoVITS supports Korean and few-shot voice cloning with a lighter runtime profile.

## Upstream

- Repository: https://github.com/RVC-Boss/GPT-SoVITS
- Docker images: https://hub.docker.com/r/xxxxrt666/gpt-sovits
- Official API example: `api_v2.py` exposes `POST /tts` on port `9880`

## What To Download

For simple AIRI inference, you need these three things:

1. The Docker image itself
2. At least one reference voice wav file
3. GPT-SoVITS pretrained model files inside the mounted appdata folder

Official upstream notes say Docker can run the service, and pretrained model files should be placed under `GPT_SoVITS/pretrained_models`.

## Unraid Terminal Commands

Create the working folders first:

```bash
mkdir -p /mnt/user/appdata/gpt-sovits/GPT_SoVITS/pretrained_models
mkdir -p /mnt/user/appdata/gpt-sovits/refs
mkdir -p /mnt/user/appdata/gpt-sovits/tools/asr/models
mkdir -p /mnt/user/appdata/gpt-sovits/tools/uvr5/uvr5_weights
```

Pull the lighter CUDA image first:

```bash
docker pull xxxxrt666/gpt-sovits:latest-cu126-lite
```

If that tag does not work on the current upstream release, check available tags on Docker Hub and replace it with the current `cu126-lite` or `cu128-lite` tag.

## How To Get Model Files

The easiest practical path on Unraid is:

1. Open the Hugging Face model page from another machine or your browser.
2. Download the pretrained files you want.
3. Copy them into `/mnt/user/appdata/gpt-sovits/GPT_SoVITS/pretrained_models`.

Primary model source:

- https://huggingface.co/lj1995/GPT-SoVITS/tree/main

For Korean inference without training a custom model first, start with one of the official pretrained branches that upstream documents, typically v2, v3, or v4. On a GTX 1070, start conservative and avoid the heaviest setups.

If you want to download directly on Unraid with `wget`, install a terminal utility container or use the Nerd Tools package if available. Example pattern:

```bash
cd /mnt/user/appdata/gpt-sovits/GPT_SoVITS/pretrained_models
wget -O s2Gv3.pth "<direct-download-url>"
wget -O s1v3.ckpt "<direct-download-url>"
```

I am not hardcoding the direct file URLs here because Hugging Face download links change across model versions. Use the file's `Download` button and copy that final URL if you want to use `wget`.

### Stable command-based download on Unraid

The most stable way is to use a temporary Python container and download from Hugging Face with `snapshot_download`.

Recommended starting set for GTX 1070: v3 inference files.

```bash
mkdir -p /mnt/user/appdata/gpt-sovits/GPT_SoVITS/pretrained_models

docker run --rm \
  -v /mnt/user/appdata/gpt-sovits/GPT_SoVITS/pretrained_models:/models \
  python:3.11-slim \
  bash -lc "pip install -q huggingface_hub && python -c \"from huggingface_hub import snapshot_download; snapshot_download(repo_id='lj1995/GPT-SoVITS', local_dir='/models', local_dir_use_symlinks=False, allow_patterns=['s1v3.ckpt', 's2Gv3.pth', 'models--nvidia--bigvgan_v2_24khz_100band_256x/*'])\""
```

If you want the older lighter baseline files instead:

```bash
mkdir -p /mnt/user/appdata/gpt-sovits/GPT_SoVITS/pretrained_models

docker run --rm \
  -v /mnt/user/appdata/gpt-sovits/GPT_SoVITS/pretrained_models:/models \
  python:3.11-slim \
  bash -lc "pip install -q huggingface_hub && python -c \"from huggingface_hub import snapshot_download; snapshot_download(repo_id='lj1995/GPT-SoVITS', local_dir='/models', local_dir_use_symlinks=False, allow_patterns=['s1bert25hz-2kh-longer-epoch=68e-step=50232.ckpt', 's2G488k.pth'])\""
```

To verify what was downloaded:

```bash
find /mnt/user/appdata/gpt-sovits/GPT_SoVITS/pretrained_models -maxdepth 3 -type f | sort
```

If you prefer direct `wget`, these are known examples for some core files:

```bash
cd /mnt/user/appdata/gpt-sovits/GPT_SoVITS/pretrained_models
wget -O s1v3.ckpt "https://huggingface.co/lj1995/GPT-SoVITS/resolve/main/s1v3.ckpt?download=true"
wget -O s2Gv3.pth "https://huggingface.co/lj1995/GPT-SoVITS/resolve/main/s2Gv3.pth?download=true"
wget -O s1bert25hz-2kh-longer-epoch=68e-step=50232.ckpt "https://huggingface.co/lj1995/GPT-SoVITS/resolve/main/s1bert25hz-2kh-longer-epoch%3D68e-step%3D50232.ckpt?download=true"
wget -O s2G488k.pth "https://huggingface.co/lj1995/GPT-SoVITS/resolve/main/s2G488k.pth?download=true"
```

For v3, the `bigvgan` folder is also required, so the `snapshot_download` command above is the safer choice.

## Reference Voice File

Put your Korean reference wav file here:

```bash
cp /path/to/your/airi-ko.wav /mnt/user/appdata/gpt-sovits/refs/
```

Recommended reference clip:

- 5 to 15 seconds
- clean single speaker
- little or no background music
- exact transcript saved separately for AIRI `Prompt Text`

## Recommended shape for Unraid

1. Use the `Lite` CUDA image first.
2. Mount one folder for reference voices, for example `/mnt/user/appdata/gpt-sovits/refs`.
3. Expose port `9880`.
4. Start with fp16 enabled only if the container is stable on the GTX 1070.

Example compose snippet:

```yaml
services:
  gpt-sovits:
    image: xxxxrt666/gpt-sovits:latest-cu126-lite
    container_name: gpt-sovits
    restart: unless-stopped
    ports:
      - '9871:9871'
      - '9872:9872'
      - '9873:9873'
      - '9874:9874'
      - '9880:9880'
    environment:
      is_half: 'true'
    runtime: nvidia
    stdin_open: true
    tty: true
    shm_size: '16g'
    volumes:
      - /mnt/user/appdata/gpt-sovits:/workspace/GPT-SoVITS
      - /mnt/user/appdata/gpt-sovits/refs:/workspace/refs
      - /mnt/user/appdata/gpt-sovits/tools/asr/models:/workspace/models/asr_models
      - /mnt/user/appdata/gpt-sovits/tools/uvr5/uvr5_weights:/workspace/models/uvr5_weights
```

Save that as something like `/mnt/user/appdata/gpt-sovits/docker-compose.yml`, then run:

```bash
cd /mnt/user/appdata/gpt-sovits
docker compose up -d
```

To stop it later:

```bash
cd /mnt/user/appdata/gpt-sovits
docker compose down
```

To inspect logs:

```bash
docker logs -f gpt-sovits
```

To enter the container:

```bash
docker exec -it gpt-sovits bash
```

## First Boot Checklist

After the container starts:

1. Confirm the container is running.
2. Confirm your reference wav exists inside the container.
3. Confirm port `9880` is reachable.

Useful commands:

```bash
docker ps | grep gpt-sovits
docker exec -it gpt-sovits bash -lc 'ls -lah /workspace/refs'
curl http://127.0.0.1:9880/
```

If you want to test from another machine on your LAN:

```bash
curl http://<UNRAID-IP>:9880/
```

If the root endpoint is not useful, that is fine. AIRI uses `POST /tts`.

## AIRI settings

- Provider: `GPT-SoVITS`
- Base URL: `http://<UNRAID-IP>:9880/`
- Reference Audio Path: `/workspace/refs/airi-ko.wav`
- Prompt Text: the exact transcript spoken in that reference audio
- Prompt Language: `ko`
- Target Text Language: `ko`

Example values:

- Base URL: `http://192.168.0.35:9880/`
- Reference Audio Path: `/workspace/refs/airi-ko.wav`
- Prompt Text: `안녕하세요, 저는 AIRI입니다. 만나서 반가워요.`
- Prompt Language: `ko`
- Target Text Language: `ko`

## Notes

- GPT-SoVITS expects the reference audio path to exist inside the container.
- The prompt text should match the reference audio closely.
- If memory is tight on GTX 1070, lower concurrency and keep the container dedicated to inference only.
- If the image tag changes upstream, check Docker Hub before updating.
- If `is_half=true` is unstable on GTX 1070, try `is_half=false`.
