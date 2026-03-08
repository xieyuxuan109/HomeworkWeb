import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { submissionAPI } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function MySubmissions() {
  const [, setLocation] = useLocation();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMySubmissions();
  }, []);

  const fetchMySubmissions = async () => {
    setLoading(true);
    try {
      const response: any = await submissionAPI.getMySubmissions();
      if (response?.code === 0) {
        setSubmissions(response.data.list || []);
      } else {
        toast.error('获取提交列表失败');
      }
    } catch (error) {
      toast.error('获取提交列表失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (submission: any) => {
    if (submission.score !== null && submission.score !== undefined) {
      return <CheckCircle className="w-5 h-5 text-emerald-600" />;
    }
    return <Clock className="w-5 h-5 text-yellow-600" />;
  };

  const getStatusText = (submission: any) => {
    if (submission.score !== null && submission.score !== undefined) {
      return '已批改';
    }
    return '待批改';
  };

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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">我的提交</h1>
          <p className="text-gray-500 mt-1">查看你提交的所有作业</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-500 mt-4">加载中...</p>
          </div>
        ) : submissions.length === 0 ? (
          <Card className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无提交</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <Card
                key={submission.id}
                className="hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(submission)}
                      <h3 className="text-lg font-semibold text-gray-900">
                        {submission.homework?.title}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">部门</p>
                        <p className="font-medium text-gray-900">
                          {submission.homework?.department_label}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">提交时间</p>
                        <p className="font-medium text-gray-900">
                          {new Date(submission.submitted_at).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">状态</p>
                        <p className="font-medium text-gray-900">
                          {getStatusText(submission)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">成绩</p>
                        {submission.score !== null && submission.score !== undefined ? (
                          <p className="font-bold text-emerald-600 text-lg">
                            {submission.score}分
                          </p>
                        ) : (
                          <p className="text-gray-500">-</p>
                        )}
                      </div>
                    </div>

                    {submission.comment && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">评语</p>
                        <p className="text-sm text-gray-700">{submission.comment}</p>
                      </div>
                    )}

                    {submission.is_excellent && (
                      <div className="mt-3 inline-block px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                        ⭐ 优秀作业
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
