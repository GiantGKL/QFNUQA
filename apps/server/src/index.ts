import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import qaRoutes from './routes/qa.js';
import categoryRoutes from './routes/categories.js';
import tagRoutes from './routes/tags.js';
import quickLinkRoutes from './routes/quickLinks.js';
import searchLogRoutes from './routes/searchLogs.js';
import aiRoutes from './routes/ai.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/qa', qaRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/quick-links', quickLinkRoutes);
app.use('/api/search-logs', searchLogRoutes);
app.use('/api/ai', aiRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 错误处理
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, error: '服务器错误' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
