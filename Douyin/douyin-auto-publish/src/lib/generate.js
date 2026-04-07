function containsForbidden(text, forbiddenTerms) {
  return forbiddenTerms.find((w) => text.includes(w));
}

function pickTopics(requiredHashtags, defaultTopics) {
  const required = (requiredHashtags || []).map((x) => x.replace(/^#/, ""));
  const defaults = defaultTopics || [];
  const merged = [...required, ...defaults].filter(Boolean);
  const uniq = [...new Set(merged)];
  return uniq.slice(0, 6);
}

export async function generatePublishPackage(input, config) {
  const topics = pickTopics(input.requiredHashtags, config.defaultTopics);
  const hashtagText = topics.map((t) => `#${t}`).join(" ");
  const title = `${input.topic}：从手动发布到半自动发布`;
  const summary = `面向${input.audience}，通过标准流程减少重复操作，保留最终审核。`;
  const publishText = `${title}\n${summary}\n${hashtagText}`.trim();

  const forbiddenTerms = config?.safetyRules?.forbiddenTerms || [];
  const hit = containsForbidden(publishText, forbiddenTerms);
  if (hit) {
    throw new Error(`内容命中禁用词: ${hit}`);
  }

  return {
    title,
    summary,
    hashtags: topics.map((t) => `#${t}`),
    publishText
  };
}
