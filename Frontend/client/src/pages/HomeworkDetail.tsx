import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/lib/store';
import { homeworkAPI, submissionAPI } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft, Send } from 'lucide-react';

export default function HomeworkDetail() {
  const [, setLocation] = useLocation();
  const { id } = useParams();
  const { user } = useAuthStore();
  const [homework, setHomework] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 提交表单
  const [submitForm, setSubmitForm] = useState({
    content: '',
    file_url: '',
  });

  useEffect(() => {
    if (id) {
      fetchHomeworkDetail();
      if (user?.role === 'admin') {
        fetchSubmissions();
      }
    }
  }, [id, user]);

  const fetchHomeworkDetail = async () => {
    setLoading(true);
    try {
      const response: any = await homeworkAPI.getDetail(parseInt(id!));
      if (response?.code === 0) {
        setHomework(response.data);
      } else {
        toast.error('获取作业详情失败');
      }
    } catch (error) {
      toast.error('获取作业详情失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response: any = await submissionAPI.getHomeworkSubmissions(parseInt(id!));
      if (response?.code === 0) {
        setSubmissions(response.data.list || []);
      }
    } catch (error) {
      toast.error('获取提交列表失败');
    }
  };

  const handleSubmit = async () => {
    if (!submitForm.content.trim()) {
      toast.error('请填写提交内容');
      return;
    }

    setSubmitting(true);
    try {
      const response: any = await submissionAPI.submit({
        homework_id: parseInt(id!),
        content: submitForm.content,
        file_url: submitForm.file_url || undefined,
      });

      if (response?.code === 0) {
        toast.success('提交成功');
        setSubmitForm({ content: '', file_url: '' });
        fetchHomeworkDetail();
      } else {
        toast.error(response?.message || '提交失败');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReview = (submissionId: number) => {
    setLocation(`/review/${submissionId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-4">加载中...</p>
        </div>
      </div>
    );
  }

  if (!homework) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center py-12 max-w-md">
          <p className="text-gray-500 mb-4">作业不存在</p>
          <Button onClick={() => setLocation('/')}>返回首页</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="ghost"
            className="gap-2 text-emerald-600 hover:text-emerald-700"
            onClick={() => setLocation('/')}
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </Button>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 作业信息 */}
        <Card className="mb-8 p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {homework.title}
            </h1>
            <div className="flex gap-4 text-sm text-gray-600">
              <span>部门: {homework.department_label}</span>
              <span>发布者: {homework.creator?.nickname}</span>
            </div>
          </div>

          <div className="prose prose-sm max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-wrap">{homework.description}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
            <div>
              <p className="text-xs text-gray-500 mb-1">截止时间</p>
              <p className="font-semibold text-gray-900">
                {new Date(homework.deadline).toLocaleDateString('zh-CN')}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">允许迟交</p>
              <p className="font-semibold text-gray-900">
                {homework.allow_late ? '是' : '否'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">总提交数</p>
              <p className="font-semibold text-gray-900">
                {homework.submission_count}
              </p>
            </div>
            {homework.my_submission && (
              <div>
                <p className="text-xs text-gray-500 mb-1">我的成绩</p>
                <p className="font-semibold text-emerald-600">
                  {homework.my_submission.score !== null
                    ? `${homework.my_submission.score}分`
                    : '待批改'}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* 学生提交表单 */}
        {user?.role === 'student' && (
          <Card className="mb-8 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">提交作业</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="content" className="text-gray-700">
                  提交内容 *
                </Label>
                <Textarea
                  id="content"
                  placeholder="请输入或粘贴你的作业内容..."
                  value={submitForm.content}
                  onChange={(e) => setSubmitForm({ ...submitForm, content: e.target.value })}
                  className="mt-2 min-h-32 border-gray-300 focus:border-emerald-500"
                />
              </div>

              <div>
                <Label htmlFor="file_url" className="text-gray-700">
                  附件链接（可选）
                </Label>
                <Input
                  id="file_url"
                  placeholder="输入文件链接..."
                  value={submitForm.file_url}
                  onChange={(e) => setSubmitForm({ ...submitForm, file_url: e.target.value })}
                  className="mt-2 border-gray-300 focus:border-emerald-500"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white w-full"
              >
                <Send className="w-4 h-4" />
                {submitting ? '提交中...' : '提交作业'}
              </Button>
            </div>
          </Card>
        )}

        {/* 老师批改列表 */}
        {user?.role === 'admin' && submissions.length > 0 && (
          <Card className="p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">学生提交</h2>
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {submission.student?.nickname}
                      </p>
                      <p className="text-sm text-gray-500">
                        提交时间: {new Date(submission.submitted_at).toLocaleString('zh-CN')}
                      </p>
                    </div>
                    <div className="text-right">
                      {submission.score !== null ? (
                        <p className="text-lg font-bold text-emerald-600">
                          {submission.score}分
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">待批改</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReview(submission.id)}
                    className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                  >
                    查看/批改
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
