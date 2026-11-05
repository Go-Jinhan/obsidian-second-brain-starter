---
type: Reference
source:
  - "[[_Getting-Started]]"
  - "[[_Second-Brain-Design]]"
tags: [guide]
---

![Obsidian으로 연결되는 메모](assets/second-brain-banner-obsidian.png)

# 나의 세컨드 브레인

**한국어** · [English](Welcome.en.md)

기억하고 싶은 것을 적고, 지금 하는 일에 가져다 써보세요. *CODE* 기법은 수집한 정보를 정리하고 핵심을 추출해 활용하는 흐름을, *PARA* 분류법은 자료를 둘 자리를, *제텔카스텐* 노트 작성법은 생각을 설명하고 연결하는 방법을 제공합니다.

## 오늘은 메모 하나로 시작하기

명령 팔레트에서 **Second Brain Starter: Create note**를 실행하세요. 떠오른 생각, 참고 자료, 책, 프로젝트, 영구 노트 중 하나를 고를 수 있습니다. 출처를 입력하면 노트의 `source` 속성에 함께 남습니다.

프로젝트를 만들었다면 관련 자료를 그 폴더로 모아 사용하세요. 끝난 뒤 다시 쓸 자료는 Resources로, 진행 과정과 결과는 Archives로 옮깁니다. 처음의 목표는 *Twyla Tharp First Memo*, 작업 기록은 *Project Progress*, 다음에 이어갈 행동은 *The Hemingway Bridge*에 적습니다.

## 어디에 무엇을 쓰는지 궁금하다면

[[_Getting-Started]]부터 읽고 [[_Capture]], [[_Organize]], [[_Projects]], [[_Distill]]로 이어가보세요. 각 폴더의 `_` 안내 노트에서 역할과 사용 예를 설명합니다. [[_Resources]]의 분야와 번호는 자신의 관심사에 맞게 바꿀 수 있습니다.

## 템플릿을 더 활용하기

이 플러그인의 Create note 명령은 다른 플러그인 없이 작동합니다. 포함된 `TPL -` 파일을 직접 실행하려면 Templater를, 날짜별 기록을 자동으로 만들려면 Periodic Notes를 별도로 설치하세요.

Templater의 템플릿 폴더는 다음 위치입니다.

`20. Organize/23. Resources/📖1000. Reference/📚1090. Settings/📚1091. Templates`

일간·주간·월간 기록은 다음 상위 폴더 아래에 둡니다.

`20. Organize/23. Resources/📖1000. Reference/📚1010. Periodic Notes`

- Daily: `1011. Daily`, `YYYY-MM-DD (ddd)`, `TPL - Daily Note`
- Weekly: `1012. Weekly`, `GGGG-[W]WW`, `TPL - Weekly Note`
- Monthly: `1013. Monthly`, `YYYY-MM`, `TPL - Monthly Note`

영어 템플릿은 이름 끝에 `.en`이 붙습니다. 생성한 노트에 `<%` 코드가 남으면 **Templater: Replace templates in the active file**을 실행합니다. 리뷰 방법은 [[_Periodic-Notes]]에서 읽을 수 있습니다.

다시 설치하면 없는 파일만 추가합니다. 플러그인을 끄거나 제거해도 작성한 노트는 남습니다.
