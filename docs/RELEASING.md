# 배포 절차

공식 절차: https://docs.obsidian.md/Plugins/Releasing/Submit+your+plugin

1. 공개할 코드·포함 자료·라이선스와 릴리스 버전을 확정한다.
2. `npm ci`와 `npm run package`를 실행하고 새 볼트에서 설치를 확인한다.
3. `manifest.json`, `package.json`, 잠금 파일, `versions.json`의 버전을 맞춘다.
4. 소스 코드를 공개 GitHub 저장소에 올린다. 루트에 README, LICENSE, manifest.json이 있어야 한다.
5. `0.1.0`처럼 manifest 버전과 같은 태그로 릴리스를 만들고 `dist/second-brain-starter/`의 `main.js`, `manifest.json`, `styles.css`를 각각 첨부한다.
6. https://community.obsidian.md/account/plugins/new 에서 연결된 GitHub 계정의 저장소를 제출한다. 개발자 정책과 지속적인 지원에 대한 동의가 필요하다.
7. 자동 검토 결과를 확인하고 오류를 수정한 뒤 디렉터리 공개를 완료한다.
8. 공개 페이지, 공식 디렉터리, Obsidian 안의 검색 결과를 확인한다. GitHub 릴리스 생성과 커뮤니티 디렉터리 공개는 별도 단계다.

`node_modules`, 테스트 볼트와 프로필, 개인 설정은 공개 소스나 배포 파일에 포함하지 않는다. 다른 플러그인을 자동 설치하거나 업데이트하는 기능을 추가하지 않는다.
