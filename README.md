# youth-career-hub
20대 청년들을 대상으로 취업 정보를 제공하고, 커뮤니티를 형성하여 취업 준비에 도움을 주는 플랫폼 개발


## git-flow 적용 : branch 설정
- **main**(필수, master) : 최종 배포 가능한 상태의 코드를 유지하는 브랜치
- **develop**(필수, main으로부터 생성) : 개발 중인 코드를 통합하는 브랜치
- features(develop으로부터 생성) : 각 기능을 구현할 때마다 각자 생성하여 개발하는 브랜치
→ 기능이 완성되면 develop에 merge
- release(develop으로부터 생성) : 기능이 완성된 develop 브랜치에서 QA를 하기 위해 생성한 브랜치
→ 버그 fix 후 develop, main 브랜치에 merge (main에서 버전 추가를 위한 태그 생성 후 배포)
- hotfixes(main으로부터 생성) : 배포 후 발생된 버그 수정 후 태그 생성하여 배포
→ 발견된 버그 수정 후 main, develop 브랜치에 merge