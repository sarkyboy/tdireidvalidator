import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 英文翻译资源
const enTranslations = {
  title: 'ReID Analysis Tool',
  selectFolder: 'Select Image Folder',
  processing: 'Processing images, please wait...',
  statistics: 'Statistics',
  totalIdentities: 'Total Identities',
  verifiedIdentities: 'Verified Identities',
  recognitionRate: 'Recognition Rate',
  overMerged: 'Over Merged',
  underMerged: 'Under Merged',
  accuracyFormula: 'Accuracy Formula: (1 - (OverMerged + UnderMerged) / TotalRecognized) * 100%',
  filterByDuration: 'Filter by Duration (minutes)',
  minutes: 'minutes',
  relatedImages: 'All Related Images',
  startTime: 'Start Time',
  endTime: 'End Time',
  duration: 'Duration',
  identitiesInFolder: 'Number of identities in this folder',
  copied: 'Copied UUID:',
  language: 'Language',
  captureCount: 'Capture Count',
  copyUUID: 'Copy UUID',
  markAsNew: 'Mark as New Identity',
  alreadyMarked: 'Already Marked as New'
};

// 中文翻译资源
const zhTranslations = {
  title: 'ReID 分析工具',
  selectFolder: '选择图片文件夹',
  processing: '正在处理图片文件，请稍候...',
  statistics: '统计信息',
  totalIdentities: '总身份数',
  verifiedIdentities: '已验证身份数',
  recognitionRate: '识别率',
  overMerged: '过度合并(OverMerged)',
  underMerged: '欠合并(UnderMerged)',
  accuracyFormula: '准确率计算公式: (1 - (OverMerged + UnderMerged) / TotalRecognized) * 100%',
  filterByDuration: '按停留时间筛选 (分钟)',
  minutes: '分钟',
  relatedImages: '所有相关图片',
  startTime: '开始时间',
  endTime: '结束时间',
  duration: '持续时间',
  identitiesInFolder: '此文件夹包含的身份数量',
  copied: '已复制UUID:',
  language: '语言',
  captureCount: '捕获次数',
  copyUUID: '复制UUID',
  markAsNew: '标记为新身份',
  alreadyMarked: '已标记为新身份'
};

// 初始化i18n
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      zh: {
        translation: zhTranslations
      }
    },
    lng: 'en', // 默认语言为英文
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // 不转义HTML内容
    }
  });

export default i18n;