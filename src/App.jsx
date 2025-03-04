import React, { useState, useEffect, useRef } from 'react';
import { Box, Container, Typography, Button, Slider, Paper, Grid, Modal, Tooltip, Alert, Snackbar, CircularProgress, Dialog, DialogContent, DialogContentText, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';

const App = () => {
  const objectUrlsRef = useRef([]);
  const [folders, setFolders] = useState([]);
  const [totalUUIDFolders, setTotalUUIDFolders] = useState(0);
  const [totalCountInput, setTotalCountInput] = useState(0);
  const [recognitionPercentage, setRecognitionPercentage] = useState('100.00%');
  const [durationFilter, setDurationFilter] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImages, setCurrentImages] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [overMerged, setOverMerged] = useState(0);
  const [underMerged, setUnderMerged] = useState(0);

  const extractImageUUID = (name) => {
    const re = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/;
    const match = name.match(re);
    return match ? match[0] : null;
  };

  const isUUIDFolder = (name) => {
    const re = /^\d{6}_[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
    return re.test(name);
  };

  const handleFolderSelect = async () => {
    try {
      setIsLoading(true);
      const dirHandle = await window.showDirectoryPicker();
      const processedFolders = await processDirectory(dirHandle);
      
      setFolders(processedFolders);
      setTotalUUIDFolders(processedFolders.length);
      
      // 总身份数默认等于文件夹数量
      setTotalCountInput(processedFolders.length);
      
      // 初始化时过度合并为0
      setOverMerged(0);
      setUnderMerged(0);
      setRecognitionPercentage('100.00%');
    } catch (error) {
      console.error('Error selecting folder:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processDirectory = async (dirHandle, path = '') => {
    const entries = [];
    
    // 处理当前目录下的所有条目
    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'directory') {
        // 如果是UUID格式的文件夹，直接处理
        if (isUUIDFolder(entry.name)) {
          const folderData = await processUUIDFolder(entry, path + '/' + entry.name);
          entries.push(folderData);
        } 
        // 如果不是UUID格式的文件夹，递归处理其子文件夹
        else {
          const subEntries = await processDirectory(entry, path + '/' + entry.name);
          entries.push(...subEntries);
        }
      }
    }
    return entries;
  };

  const processUUIDFolder = async (dirHandle, path) => {
    const images = [];
    const imageMap = new Map();
    const imageFiles = [];
    const subFolders = [];
    
    // 首先收集所有图片文件和子文件夹
    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'file' && entry.name.toLowerCase().endsWith('.jpg')) {
        imageFiles.push(entry);
      } else if (entry.kind === 'directory') {
        subFolders.push(entry);
      }
    }
    
    // 按文件名排序
    imageFiles.sort((a, b) => a.name.localeCompare(b.name));
    
    // 处理排序后的图片
    for (const entry of imageFiles) {
      const uuid = extractImageUUID(entry.name);
      if (uuid) {
        const file = await entry.getFile();
        const imageUrl = URL.createObjectURL(file);
        // 保存创建的URL以便后续清理
        objectUrlsRef.current.push(imageUrl);
        
        if (!imageMap.has(uuid)) {
          imageMap.set(uuid, {
            filePath: imageUrl,
            uuid: uuid,
            count: 1,
            relatedImages: [imageUrl],
            fileName: entry.name
          });
        } else {
          const imgData = imageMap.get(uuid);
          imgData.count++;
          imgData.relatedImages.push(imageUrl);
        }
      }
    }
    
    // 处理子文件夹中的图片
    for (const subFolder of subFolders) {
      for await (const entry of subFolder.values()) {
        if (entry.kind === 'file' && entry.name.toLowerCase().endsWith('.jpg')) {
          const uuid = extractImageUUID(entry.name);
          if (uuid) {
            const file = await entry.getFile();
            const imageUrl = URL.createObjectURL(file);
            // 保存创建的URL以便后续清理
            objectUrlsRef.current.push(imageUrl);
            
            if (!imageMap.has(uuid)) {
              imageMap.set(uuid, {
                filePath: imageUrl,
                uuid: uuid,
                count: 1,
                relatedImages: [imageUrl],
                fileName: entry.name
              });
            } else {
              const imgData = imageMap.get(uuid);
              imgData.count++;
              imgData.relatedImages.push(imageUrl);
            }
          }
        }
      }
    }
    
    // 将Map转换为数组
    imageMap.forEach(imgData => images.push(imgData));
    
    // 按UUID排序
    images.sort((a, b) => a.uuid.localeCompare(b.uuid));
    
    // 计算持续时间
    let duration = '00:00:00';
    let firstImageName = '';
    let lastImageName = '';
    
    // 收集所有图片文件（包括主文件夹和所有子文件夹中的图片）
    const allImageFiles = [...imageFiles];
    
    // 从子文件夹中收集所有图片文件名
    for (const subFolder of subFolders) {
      for await (const entry of subFolder.values()) {
        if (entry.kind === 'file' && entry.name.toLowerCase().endsWith('.jpg')) {
          allImageFiles.push(entry);
        }
      }
    }
    
    if (allImageFiles.length >= 2) {
      try {
        // 提取所有图片的时间戳
        const timeRegex = /^\d{14}/;
        const timeStamps = [];
        
        for (const imageFile of allImageFiles) {
          const match = imageFile.name.match(timeRegex);
          if (match) {
            const timeStr = match[0];
            // 创建日期对象
            const date = new Date(
              parseInt(timeStr.substring(0, 4)), // 年
              parseInt(timeStr.substring(4, 6)) - 1, // 月（0-11）
              parseInt(timeStr.substring(6, 8)), // 日
              parseInt(timeStr.substring(8, 10)), // 时
              parseInt(timeStr.substring(10, 12)), // 分
              parseInt(timeStr.substring(12, 14) || 0) // 秒
            );
            timeStamps.push({ date, timeStr });
          }
        }
        
        if (timeStamps.length >= 2) {
          // 按时间排序
          timeStamps.sort((a, b) => a.date - b.date);
          
          // 获取最早和最晚的时间戳
          const firstTimeStamp = timeStamps[0];
          const lastTimeStamp = timeStamps[timeStamps.length - 1];
          
          const firstTimeStr = firstTimeStamp.timeStr;
          const lastTimeStr = lastTimeStamp.timeStr;
          
          // 格式化为HH:MM
          firstImageName = `${firstTimeStr.substring(8, 10)}:${firstTimeStr.substring(10, 12)}`;
          lastImageName = `${lastTimeStr.substring(8, 10)}:${lastTimeStr.substring(10, 12)}`;
          
          // 计算时间差
          const diffMs = lastTimeStamp.date - firstTimeStamp.date;
          const diffHrs = Math.floor(diffMs / 3600000);
          const diffMins = Math.floor((diffMs % 3600000) / 60000);
          const diffSecs = Math.floor((diffMs % 60000) / 1000);
          
          duration = `${String(diffHrs).padStart(2, '0')}:${String(diffMins).padStart(2, '0')}:${String(diffSecs).padStart(2, '0')}`;
        }
      } catch (error) {
        console.error('Error calculating duration:', error);
      }
    } else if (allImageFiles.length === 1) {
      // 如果只有一张图片，持续时间为0，但仍然设置开始和结束时间
      const timeRegex = /^\d{14}/;
      const timeMatch = allImageFiles[0].name.match(timeRegex);
      const timeStr = timeMatch ? timeMatch[0] : allImageFiles[0].name.substring(0, 14);
      firstImageName = lastImageName = `${timeStr.substring(8, 10)}:${timeStr.substring(10, 12)}`;
    }
    
    return {
      folderUUID: dirHandle.name,
      folderPath: path,
      images: images,
      countInput: 1,  // 默认每个文件夹对应1个身份
      duration: duration,
      firstImageName: firstImageName,
      lastImageName: lastImageName
    };
  };
  
  const formatTime = (timeStr) => {
    if (timeStr.length >= 6) {
      // 如果是完整的时间字符串，提取小时和分钟部分
      return `${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}`;
    }
    return '';
  };

  // 标记图片为新身份（欠合并）
  const toggleNewIdentity = (folderIndex, imageIndex) => {
    setFolders(prevFolders => {
      const newFolders = [...prevFolders];
      const image = newFolders[folderIndex].images[imageIndex];
      image.isNewIdentity = !image.isNewIdentity;
      
      // 计算欠合并数量
      const newUnderMerged = newFolders.reduce((sum, folder) => {
        return sum + folder.images.filter(img => img.isNewIdentity).length;
      }, 0);
      setUnderMerged(newUnderMerged);
      
      // 更新准确率
      updateAccuracy(newFolders, newUnderMerged);
      
      return newFolders;
    });
  };

  // 更新身份数量输入
  const updateIdentityCount = (folderIndex, imageIndex, count) => {
    setFolders(prevFolders => {
      const newFolders = [...prevFolders];
      const image = newFolders[folderIndex].images[imageIndex];
      image.countInput = Math.max(1, count); // 确保至少为1
      
      // 计算总验证身份数
      const newTotal = newFolders.reduce((sum, folder) => {
        return sum + folder.images.reduce((folderSum, img) => folderSum + img.countInput, 0);
      }, 0);
      setTotalCountInput(newTotal);
      
      // 计算过度合并数量
      const newOverMerged = Math.max(0, newTotal - totalUUIDFolders);
      setOverMerged(newOverMerged);
      
      // 更新准确率
      updateAccuracy(newFolders, underMerged);
      
      return newFolders;
    });
  };

  // 更新文件夹级别的身份数量
  const updateFolderIdentityCount = (folderIndex, count) => {
    setFolders(prevFolders => {
      const newFolders = [...prevFolders];
      newFolders[folderIndex].countInput = Math.max(1, count); // 确保至少为1
      
      // 计算总验证身份数
      const newTotal = newFolders.reduce((sum, folder) => sum + folder.countInput, 0);
      setTotalCountInput(newTotal);
      
      // 计算过度合并数量
      const newOverMerged = Math.max(0, newTotal - totalUUIDFolders);
      setOverMerged(newOverMerged);
      
      // 更新准确率
      updateAccuracy(newFolders, underMerged);
      
      return newFolders;
    });
  };

  // 更新准确率计算
  const updateAccuracy = (currentFolders, currentUnderMerged) => {
    const total = currentFolders.reduce((sum, folder) => sum + folder.countInput, 0);
    
    if (total === 0) {
      setRecognitionPercentage('100.00%');
    } else {
      const currentOverMerged = Math.max(0, total - totalUUIDFolders);
      const accuracy = Math.max(0, 1 - (currentOverMerged + currentUnderMerged) / total) * 100;
      setRecognitionPercentage(accuracy.toFixed(2) + '%');
    }
  };

  const handleImageClick = (images) => {
    setCurrentImages(images);
    setModalOpen(true);
  };

  const copyUUID = (uuid) => {
    navigator.clipboard.writeText(uuid).then(() => {
      setNotification({
        open: true,
        message: `已复制UUID: ${uuid}`
      });
    });
  };

  const closeNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // 根据持续时间筛选文件夹
  const filteredFolders = folders.filter(folder => {
    if (durationFilter === 0) return true;
    
    const durationParts = folder.duration.split(':');
    const durationHours = parseInt(durationParts[0]);
    const durationMinutes = parseInt(durationParts[1]);
    
    const totalDurationInMinutes = durationHours * 60 + durationMinutes;
    return totalDurationInMinutes >= durationFilter;
  });

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ReID Analysis Tool
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          onClick={handleFolderSelect}
          sx={{ mb: 3, mr: 2 }}
          disabled={isLoading}
        >
          选择图片文件夹
        </Button>

        <Dialog open={isLoading} disableEscapeKeyDown>
          <DialogContent sx={{ textAlign: 'center', p: 4 }}>
            <CircularProgress sx={{ mb: 2 }} />
            <DialogContentText>正在处理图片文件，请稍候...</DialogContentText>
          </DialogContent>
        </Dialog>



        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            统计信息
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Typography>总身份数: {totalUUIDFolders}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography>已验证身份数: {totalCountInput}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography>识别率: {recognitionPercentage}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography>过度合并(OverMerged): {overMerged}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography>欠合并(UnderMerged): {underMerged}</Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={12}>
              <Typography variant="caption">
                准确率计算公式: (1 - (OverMerged + UnderMerged) / TotalRecognized) * 100%
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography gutterBottom>按停留时间筛选 (分钟)</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Slider
              value={durationFilter}
              onChange={(_, value) => setDurationFilter(value)}
              min={0}
              max={600}
              step={3}
              valueLabelDisplay="auto"
              sx={{ flex: 1, mx: 2 }}
            />
            <Typography variant="body2" sx={{ minWidth: 80 }}>
              {durationFilter} 分钟
            </Typography>
          </Box>
        </Paper>

        {/* 模态框用于显示相关图片 */}
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          aria-labelledby="modal-title"
        >
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: 1000,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <Typography id="modal-title" variant="h6" component="h2" gutterBottom>
              所有相关图片
            </Typography>
            <Grid container spacing={1}>
              {currentImages.map((imgUrl, idx) => (
                <Grid item xs={2} sm={1} key={idx}>
                  <img 
                    src={imgUrl} 
                    alt={`Related ${idx}`} 
                    style={{ width: '100%', height: 'auto' }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Modal>

        {/* 通知提示 */}
        <Snackbar
          open={notification.open}
          autoHideDuration={5000}
          onClose={closeNotification}
          message={notification.message}
        />

        <Grid container spacing={2}>
          {filteredFolders.map((folder, index) => (
            <Grid item xs={12} key={folder.folderUUID}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">{folder.folderUUID}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    开始时间: {folder.firstImageName} | 结束时间: {folder.lastImageName} | 持续时间: {folder.duration}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    此文件夹包含的身份数量:
                  </Typography>
                  <input 
                    type="number" 
                    min="1" 
                    value={folder.countInput || 1} 
                    onChange={(e) => updateFolderIdentityCount(index, parseInt(e.target.value) || 1)}
                    style={{ width: '60px' }}
                  />
                </Box>
                <Grid container spacing={1}>
                  {folder.images.map((image) => (
                    <Grid item xs={6} sm={4} md={2} lg={1} key={image.uuid}>
                      <Box sx={{ border: '1px solid #eee', borderRadius: 1, p: 1 }}>
                        <img
                          src={image.filePath}
                          alt={image.uuid}
                          style={{ width: '100%', height: 'auto', cursor: 'pointer' }}
                          onClick={() => handleImageClick(image.relatedImages)}
                        />
                        <Typography variant="caption" display="block" noWrap>
                          UUID: {image.uuid.substring(0, 8)}...
                        </Typography>
                        <Typography variant="caption" display="block">
                          捕获次数: {image.count}
                        </Typography>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          fullWidth 
                          onClick={() => copyUUID(image.uuid)}
                          sx={{ fontSize: '0.7rem', mt: 1 }}
                        >
                          复制UUID
                        </Button>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color={image.isNewIdentity ? "primary" : "inherit"}
                          fullWidth 
                          onClick={() => toggleNewIdentity(index, folder.images.indexOf(image))}
                          sx={{ fontSize: '0.7rem', mt: 1 }}
                        >
                          {image.isNewIdentity ? "已标记为新身份" : "标记为新身份"}
                        </Button>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default App;