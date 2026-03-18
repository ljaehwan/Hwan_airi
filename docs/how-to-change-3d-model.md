# How to Change the 3D Model (아바타 3D 모델 변경 방법)

> **English** | [한국어](#한국어)

---

## English

Project AIRI uses **VRM** (Virtual Reality Model) files as its 3D avatar format.  
You can change the displayed 3D character in two ways:

### Option 1 – Through the UI (no rebuild required)

1. Open the application (web or desktop).
2. Click the **Model Selector** button (usually in the settings / stage area).
3. Click **Add → VRM** and choose your `.vrm` file.
4. Click **Pick** on the newly uploaded model to activate it.

Your selection is saved in the browser's local storage and IndexedDB, so it persists across page reloads.

### Option 2 – Via environment variable (build-time default)

This is the recommended approach when you want **everyone who visits your fork** to see a specific model without any manual UI step.

#### 2a. Place the model file

Put your `.vrm` file (and an optional preview image) somewhere publicly accessible:

| Location | Example path |
|---|---|
| `apps/stage-web/public/models/` | `apps/stage-web/public/models/my-avatar.vrm` |
| Remote HTTPS server | `https://example.com/my-avatar.vrm` |

If you use the `public/` folder, the file will be served at `/models/my-avatar.vrm` after the build.

#### 2b. Set environment variables

Copy `.env.example` to `.env` (or `.env.local`) at the repository root and set:

```dotenv
VITE_CUSTOM_VRM_MODEL_URL=/models/my-avatar.vrm
VITE_CUSTOM_VRM_MODEL_NAME=My Avatar
VITE_CUSTOM_VRM_MODEL_PREVIEW_URL=/models/my-avatar-preview.png
```

| Variable | Required | Description |
|---|---|---|
| `VITE_CUSTOM_VRM_MODEL_URL` | **Yes** | Path or URL to the `.vrm` file |
| `VITE_CUSTOM_VRM_MODEL_NAME` | No | Name shown in the model selector (default: `Custom Model`) |
| `VITE_CUSTOM_VRM_MODEL_PREVIEW_URL` | No | Thumbnail image URL/path |
| `VITE_DEFAULT_MODEL_ID` | No | Override the default-selected preset ID (default: `preset-vrm-custom` when a custom URL is set) |

#### 2c. Rebuild

```bash
pnpm -F @proj-airi/stage-web build
# or for the desktop app:
pnpm -F @proj-airi/stage-tamagotchi build
```

#### What happens

When the app starts for the first time (empty local storage), it automatically selects the custom model.  
Returning users who previously chose a different model keep their own selection.

### Supported model formats

| Format | Preset IDs | Notes |
|---|---|---|
| VRM 0.x / 1.0 | `preset-vrm-1`, `preset-vrm-2`, `preset-vrm-custom` | Recommended 3D format |
| Live2D ZIP | `preset-live2d-1`, `preset-live2d-2` | 2D format |

---

## 한국어

Project AIRI는 3D 아바타 포맷으로 **VRM** (Virtual Reality Model) 파일을 사용합니다.  
3D 캐릭터를 변경하는 방법은 두 가지입니다.

### 방법 1 – UI를 통해 변경 (리빌드 불필요)

1. 앱을 엽니다 (웹 또는 데스크탑).
2. **Model Selector** 버튼을 클릭합니다 (설정 또는 스테이지 영역에 위치).
3. **Add → VRM** 을 클릭하고 `.vrm` 파일을 선택합니다.
4. 새로 추가된 모델에서 **Pick** 을 클릭해 적용합니다.

선택 사항은 브라우저의 로컬 스토리지와 IndexedDB에 저장되어 페이지를 새로고침해도 유지됩니다.

### 방법 2 – 환경 변수를 통해 변경 (빌드 기본값 지정)

이 방법은 **여러분의 포크를 방문하는 모든 사람**이 특정 모델을 UI 조작 없이 바로 볼 수 있도록 하고 싶을 때 권장됩니다.

#### 2a. 모델 파일 배치

`.vrm` 파일(및 선택적으로 미리보기 이미지)을 공개적으로 접근 가능한 위치에 배치합니다:

| 위치 | 경로 예시 |
|---|---|
| `apps/stage-web/public/models/` | `apps/stage-web/public/models/my-avatar.vrm` |
| 원격 HTTPS 서버 | `https://example.com/my-avatar.vrm` |

`public/` 폴더를 사용하면 빌드 후 `/models/my-avatar.vrm` 경로로 서빙됩니다.

#### 2b. 환경 변수 설정

저장소 루트의 `.env.example` 파일을 `.env` (또는 `.env.local`) 로 복사하고 다음을 설정합니다:

```dotenv
VITE_CUSTOM_VRM_MODEL_URL=/models/my-avatar.vrm
VITE_CUSTOM_VRM_MODEL_NAME=나의 아바타
VITE_CUSTOM_VRM_MODEL_PREVIEW_URL=/models/my-avatar-preview.png
```

| 변수 | 필수 여부 | 설명 |
|---|---|---|
| `VITE_CUSTOM_VRM_MODEL_URL` | **필수** | `.vrm` 파일의 경로 또는 URL |
| `VITE_CUSTOM_VRM_MODEL_NAME` | 선택 | 모델 선택기에 표시될 이름 (기본값: `Custom Model`) |
| `VITE_CUSTOM_VRM_MODEL_PREVIEW_URL` | 선택 | 썸네일 이미지 URL/경로 |
| `VITE_DEFAULT_MODEL_ID` | 선택 | 기본 선택 프리셋 ID 재정의 (커스텀 URL 설정 시 기본값: `preset-vrm-custom`) |

#### 2c. 리빌드

```bash
pnpm -F @proj-airi/stage-web build
# 또는 데스크탑 앱의 경우:
pnpm -F @proj-airi/stage-tamagotchi build
```

#### 동작 방식

앱이 처음 시작될 때(로컬 스토리지가 비어있을 때), 커스텀 모델이 자동으로 선택됩니다.  
이전에 다른 모델을 선택한 적 있는 재방문 사용자는 자신의 선택을 유지합니다.

### 지원되는 모델 포맷

| 포맷 | 프리셋 ID | 비고 |
|---|---|---|
| VRM 0.x / 1.0 | `preset-vrm-1`, `preset-vrm-2`, `preset-vrm-custom` | 권장 3D 포맷 |
| Live2D ZIP | `preset-live2d-1`, `preset-live2d-2` | 2D 포맷 |

---

### VRM 모델을 어디서 구할 수 있나요?

- [VRoid Hub](https://hub.vroid.com/) – 무료/유료 VRM 모델 다운로드
- [VRoid Studio](https://vroid.com/en/studio) – 자신만의 VRM 캐릭터 제작 무료 툴
- [Booth.pm](https://booth.pm/en/browse/VRM) – 창작자들이 판매하는 VRM 모델 마켓
- [niconicommons](https://commons.nicovideo.jp/) – VRM 포맷 3D 모델

> **⚠️ 저작권 주의**: 다운로드한 모델을 공개 서버에 배포할 때는 해당 모델의 라이선스 조건을 반드시 확인하세요.
