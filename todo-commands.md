1. /resume
     直接切历史会话，这个价值最大。飞书里可以先列最近 10 个，再用编号或 sessionId 选。
  2. /name <名字>
     给会话起名字。这个和 /resume 是一套的，不然历史会话全靠时间戳很难找。
  3. /think <off|low|medium|high> 或单独做 /reasoning
     这个在聊天场景里特别实用，能直接控制快慢、成本和回答风格。
  4. /session
     你现在已经有 /status 了，但可以补成更像 TUI 的版本，把模型、上下文、session 文件、最近活跃时间这些
     都放进来，甚至最后把 /status 并成 /session 的别名。
  5. /fork
     这个也值，但实现会比前几个重。适合“当前思路先保留，再开一条新线继续”的场景。

  我暂时不建议优先接这几个：

  - /login、/logout
    飞书里做 OAuth 交互会很别扭，体验容易烂。
  - /settings
    太大太杂，不适合直接照搬，拆成 /model、/think、/session 这种小命令更顺手。
  - /scoped-models
    得等 /model、模型列表、切换体验都更完整了再说。
