---
title: OpenClaw 接 ChatGPT 或其他模型时报错 LLM request timeout
slug: openclaw-chatgpt-llm-request-timeout
permalink: 2026/03/09/openclaw-chatgpt-llm-request-timeout/
date: 2026-03-09
tags:
  - OpenClaw
  - ChatGPT
  - WSL
  - 问题排查
categories:
  - AI 工具
---

在 Windows 使用 **WSL + Ubuntu** 时，我碰到过一个最头疼的问题，现在终于解决了：

```text
LLM request timed out
```

我当时挂了 V2RayN，并开启了 TUN 和 PAC。最开始我一直以为是代理软件本身的问题。确实，关掉 TUN 后有一阵子可以连上；但随后又出现 ChatGPT 无法访问的问题。

后来我重新梳理目标：我需要的是“在正常访问 ChatGPT 的同时，让 OpenClaw 正常工作”，所以放弃了仅靠关 TUN 的临时方案。

经过排查，最终确认关键原因是 WSL 网络模式设置：

```ini
networkingMode=mirrored
```

将其修改为：

```ini
networkingMode=nat
```

问题立刻解决。本文记录完整排查过程和最终方案。

---

## 一、问题现象

在 OpenClaw UI 中发送消息后超时，于是先在 WSL 中直接测试 OpenAI API：

```bash
curl https://api.openai.com/v1/models
```

结果：一直卡住，没有任何返回。

---

## 二、确认 Windows 网络正常

为了排除主机网络问题，在 Windows PowerShell 中测试：

```powershell
curl https://www.google.com
```

结果：正常返回 HTML 页面。

配图建议：PowerShell `curl google` 成功截图。

结论：

- Windows 网络正常
- WSL 网络异常

---

## 三、在 WSL 中测试网络

在 WSL 中运行：

```bash
curl https://www.google.com
```

结果：一直卡住。

配图建议：WSL `curl google` 卡住截图。

结论：WSL 无法访问外网。

---

## 四、WSL 网络架构背景

WSL2 并不是 Windows 进程，而是运行在 **Hyper-V 虚拟机**中。

网络结构类似：

```text
Windows
  |
Hyper-V Virtual Switch
  |
WSL Linux VM
```

WSL 具有：

- 独立虚拟网卡
- 独立路由
- 独立 DNS

WSL 支持两种网络模式：

| 模式 | 说明 |
| --- | --- |
| NAT（默认） | WSL 在虚拟子网中，通过 Windows 转发网络 |
| Mirrored | WSL 直接镜像 Windows 网卡 |

WSL 默认使用 **NAT 网络架构**。

---

## 五、问题根因：Mirrored Networking 与 VPN / TUN 冲突

我的 `.wslconfig` 配置如下：

```ini
[wsl2]
networkingMode=mirrored
dnsTunneling=true
autoProxy=true
```

Mirrored 模式会让 WSL 直接使用 Windows 网卡。理论上可以获得：

- IPv6 支持
- LAN 访问
- localhost 互通

但在实际环境中，如果系统使用：

- VPN
- V2Ray
- Clash
- TUN Adapter

就可能出现：

- Windows 网络正常
- WSL 无法访问网络

微软也确认某些 Windows 更新会导致 `Mirrored Networking + VPN` 出现网络异常，例如 `No route to host`。

核心原因之一是 VPN 虚拟网卡不会响应 ARP 请求，导致 WSL 无法解析网关地址。

---

## 六、最终解决方案

把 WSL 网络模式从 `mirrored` 改成 `nat`。

---

## 七、关键步骤

### 1. 修改 `.wslconfig`

在 Windows PowerShell 中打开：

```powershell
notepad $env:USERPROFILE\.wslconfig
```

找到：

```ini
networkingMode=mirrored
```

修改为：

```ini
networkingMode=nat
```

完整示例：

```ini
[wsl2]
networkingMode=nat
dnsTunneling=true
autoProxy=true
firewall=true
```

### 2. 重启 WSL

```powershell
wsl --shutdown
```

这一步非常关键，因为 WSL 只有在完全关闭后才会重新加载配置。

### 3. 重新打开 WSL

重新启动 Ubuntu。

---

## 八、验证网络恢复

测试 Google：

```bash
curl https://www.google.com
```

结果：返回 HTML 页面。

配图建议：WSL `curl google` 成功截图。

结论：WSL 网络恢复。

---

## 九、测试 OpenAI API

再次运行：

```bash
curl https://api.openai.com/v1/models
```

返回示例：

```json
{
  "error": {
    "message": "Missing bearer authentication in header"
  }
}
```

这个结果是正确的，因为没有提供 API Key。

结论：`WSL -> OpenAI API` 链路已恢复正常。

---

## 十、OpenClaw 恢复正常

回到 OpenClaw：

```text
http://localhost:18789
```

再次发送消息：

```text
你好
```

模型正常返回，问题解决。

---

## 十一、为什么 NAT 能解决问题

### Mirrored 模式

```text
WSL
  -> 直接使用 Windows 网卡
  -> VPN / TUN
  -> Internet
```

如果 VPN 虚拟网卡不响应 ARP：

- WSL 无法找到网关 MAC
- 结果：`No route to host`

### NAT 模式

```text
WSL
  -> 虚拟子网
  -> Windows NAT 转发
  -> VPN / Internet
```

Windows 负责路由和 ARP，因此通常不会受到 VPN 虚拟网卡限制。

---

## 十二、总结

如果 WSL 出现以下症状：

- `curl` 卡住
- `apt update` 卡住
- `pip install` 卡住
- OpenAI API timeout

可以按以下流程排查：

1. 测试网络

```bash
curl https://www.google.com
```

2. 如果失败，检查 `.wslconfig`
3. 将网络模式改为 `networkingMode=nat`
4. 重启 WSL

```powershell
wsl --shutdown
```

---

## 最终结论

在 **WSL + VPN / 代理 / TUN 环境**中，`networkingMode=nat` 通常比 `networkingMode=mirrored` 更稳定。

很多情况下，`mirrored -> nat` 可以直接修复：

- WSL 无法联网
- OpenAI API timeout
- OpenClaw request timeout

---

## 参考资料

- https://learn.microsoft.com/windows/wsl/networking
- https://informatecdigital.com/en/wsl2-advanced-guide-to-network-configuration-and-nat-and-mirrored-modes/
