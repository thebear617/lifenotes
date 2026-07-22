const topicsByBoard = {
  life: [
    { id: 'cleaning', label: '清洁' },
    { id: 'posture', label: '体态矫正' },
    { id: 'health', label: '急救及健康' },
    { id: 'electricity', label: '用电常识' },
    { id: 'kitchen', label: '厨房指南' },
  ],
};

export function topicsForBoard(boardId) {
  return topicsByBoard[boardId] || [];
}

export function topicIdForLabel(boardId, label) {
  return topicsForBoard(boardId).find((topic) => topic.label === label)?.id || label;
}
