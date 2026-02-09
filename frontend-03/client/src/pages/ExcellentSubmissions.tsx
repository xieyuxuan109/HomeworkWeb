import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { submissionAPI } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft, Award } from 'lucide-react';

export default function ExcellentSubmissions() {
  const [, setLocation] = useLocation();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExcellentSubmissions();
  }, []);

  const fetchExcellentSubmissions = async () => {
    setLoading(true);
    try {
      const response: any = await submissionAPI.getExcellent();
      if (response?.code === 0) {
        setSubmissions(response.data.list || []);
      } else {
        toast.error('获取优秀作业失败');
      }
    } catch (error) {
      toast.error('获取优秀作业失败');
    } finally {
      setLoading(false);
    }
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
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-8 h-8 text-emerald-600" />
            <h1 className="text-3xl font-bold text-gray-900">优秀作业展示</h1>
          </div>
          <p className="text-gray-500">
            展示所有被标记为优秀的作业提交
          </p>
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
            <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无优秀作业</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {submissions.map((submission) => (
              <Card
                key={submission.id}
                className="hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {submission.homework?.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        学生: {submission.student?.nickname}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 rounded-full">
                      <Award className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-semibold text-yellow-600">优秀</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">部门</span>
                      <span className="font-medium text-gray-900">
                        {submission.homework?.department_label}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">成绩</span>
                      <span className="font-bold text-emerald-600 text-lg">
                        {submission.score}分
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">提交时间</span>
                      <span className="font-medium text-gray-900">
                        {new Date(submission.submitted_at).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  </div>

                  {submission.comment && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-4">
                      <p className="text-xs text-gray-500 mb-1">评语</p>
                      <p className="text-sm text-gray-700">{submission.comment}</p>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                  >
                    查看详情
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
