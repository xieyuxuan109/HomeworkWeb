import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { submissionAPI } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';

export default function ReviewSubmission() {
  const [, setLocation] = useLocation();
  const { id } = useParams();
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  const [reviewForm, setReviewForm] = useState({
    score: '',
    comment: '',
    is_excellent: false,
  });

  useEffect(() => {
    if (id) {
      fetchSubmissionDetail();
    }
  }, [id]);

  const fetchSubmissionDetail = async () => {
    setLoading(true);
    try {
      // 这里需要一个获取单个提交的接口，暂时使用列表接口
      // 实际应该有 GET /submission/:id 接口
      toast.info('加载提交详情...');
    } catch (error) {
      toast.error('获取提交详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!reviewForm.comment.trim()) {
      toast.error('请填写评语');
      return;
    }

    setReviewing(true);
    try {
      const response: any = await submissionAPI.review(parseInt(id!), {
        score: reviewForm.score ? parseInt(reviewForm.score) : undefined,
        comment: reviewForm.comment,
        is_excellent: reviewForm.is_excellent,
      });

      if (response?.code === 0) {
        toast.success('批改成功');
        setLocation('/');
      } else {
        toast.error(response?.message || '批改失败');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '批改失败');
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
        <div className="grid grid-cols-3 gap-8">
          {/* 左侧：学生提交内容 */}
          <div className="col-span-2">
            <Card className="p-8 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">学生提交</h2>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 min-h-64">
                <p className="text-gray-700 whitespace-pre-wrap">
                  学生提交的内容会在这里显示...
                </p>
              </div>
            </Card>
          </div>

          {/* 右侧：批改表单 */}
          <div>
            <Card className="p-6 sticky top-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6">批改作业</h2>

              <div className="space-y-4">
                {/* 成绩 */}
                <div>
                  <Label htmlFor="score" className="text-gray-700 text-sm">
                    成绩 (0-100)
                  </Label>
                  <Input
                    id="score"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="输入分数"
                    value={reviewForm.score}
                    onChange={(e) => setReviewForm({ ...reviewForm, score: e.target.value })}
                    className="mt-2 border-gray-300 focus:border-emerald-500"
                  />
                </div>

                {/* 评语 */}
                <div>
                  <Label htmlFor="comment" className="text-gray-700 text-sm">
                    评语 *
                  </Label>
                  <Textarea
                    id="comment"
                    placeholder="输入批改意见..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="mt-2 min-h-24 border-gray-300 focus:border-emerald-500 text-sm"
                  />
                </div>

                {/* 优秀作业 */}
                <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg">
                  <Checkbox
                    id="is_excellent"
                    checked={reviewForm.is_excellent}
                    onCheckedChange={(checked) =>
                      setReviewForm({ ...reviewForm, is_excellent: checked as boolean })
                    }
                  />
                  <Label htmlFor="is_excellent" className="text-gray-700 text-sm cursor-pointer">
                    标记为优秀作业
                  </Label>
                </div>

                {/* 提交按钮 */}
                <Button
                  onClick={handleReview}
                  disabled={reviewing}
                  className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white mt-6"
                >
                  <Save className="w-4 h-4" />
                  {reviewing ? '保存中...' : '保存批改'}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
