export const CHALLENGE_URL = 'https://graybird.space/play/#game';
export function nextRunTip(cause = '') {
  if (/诈骗|假花生|危险花生/.test(cause)) return '下次留意花生上的裂壳和红色叉号，别把危险奖励捡进来。';
  if (/茧房/.test(cause)) return '下次看清安全圈的位置，留在圈里再找机会移动。';
  if (/狙击|弹|激光/.test(cause)) return '下次先看预警方向，小幅移动躲开弹道，反击留给密集弹幕。';
  return '下次给灰鸟留一点躲闪空间。护盾碎了先避险，反击充满再用。';
}
export function challengeText(result) {
  return `我在 Graybird 花生猎人里存活 ${result.seconds} 秒，捡到 ${result.score} 粒花生。你能撑得更久吗？`;
}
export async function shareChallenge(result, file, status, fallback) {
  const text = challengeText(result);
  try {
    if (file && navigator.canShare?.({files: [file]})) {
      await navigator.share({files: [file], title: 'Graybird 花生猎人', text: text+' '+CHALLENGE_URL});
      status.textContent = '成绩卡已交给系统分享。';
      return 'share-success';
    }
    if (navigator.share) {
      await navigator.share({title: 'Graybird 花生猎人', text, url: CHALLENGE_URL});
      status.textContent = '挑战已交给系统分享。';
      return 'share-success';
    }
    await navigator.clipboard.writeText(text+' '+CHALLENGE_URL);
    status.textContent = '成绩和挑战链接已复制。';
    return 'share-copy';
  } catch (error) {
    if (error.name === 'AbortError') { status.textContent = '分享已取消，成绩还在。'; return null; }
    fallback.hidden = false;
    fallback.querySelector('input').value = text+' '+CHALLENGE_URL;
    status.textContent = '长按下方文字复制，也可以保存成绩卡。';
    return null;
  }
}
