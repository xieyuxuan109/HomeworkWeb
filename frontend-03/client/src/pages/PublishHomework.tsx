import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { homeworkAPI } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft, Send } from 'lucide-react';

export default function PublishHomework() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    department: 'backend',
    deadline: '',
    allow_late: false,
  });

  const departments = [
    { label: '后端', value: 'backend' },
    { label: '前端', value: 'frontend' },
    { label: 'SRE', value: 'sre' },
    { label: '产品', value: 'product' },
    { label: '视觉设计', value: 'design' },
    { label: 'Android', value: 'android' },
    { label: 'iOS', value: 'ios' },
  ];

  const handlePublish = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.deadline) {
      toast.error('请填写所有必填项');
      return;
    }

    setLoading(true);
    try {
      const response: any = await homeworkAPI.create({
        title: form.title,
        description: form.description,
        department: form.department,
        deadline: form.deadline,
        allow_late: form.allow_late,
      });

      if (response?.code === 0) {
        toast.success('作业发布成功');
        setLocation('/');
      } else {
        toast.error(response?.message || '发布失败');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '发布失败');
    } finally {
      setLoading(false);
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
        <Card className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">发布新作业</h1>
          <p className="text-gray-500 mb-8">填写作业信息并发布给学生</p>

          <div className="space-y-6">
            {/* 作业标题 */}
            <div>
              <Label htmlFor="title" className="text-gray-700 font-semibold">
                作业标题 *
              </Label>
              <Input
                id="title"
                placeholder="例如：第一周作业：实现简单的 HTTP 服务器"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-2 border-gray-300 focus:border-emerald-500"
              />
            </div>

            {/* 作业描述 */}
            <div>
              <Label htmlFor="description" className="text-gray-700 font-semibold">
                作业描述 *
              </Label>
              <Textarea
                id="description"
                placeholder="详细描述作业要求、提交格式等..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-2 min-h-40 border-gray-300 focus:border-emerald-500"
              />
            </div>

            {/* 部门选择 */}
            <div>
              <Label htmlFor="department" className="text-gray-700 font-semibold">
                所属部门 *
              </Label>
              <Select value={form.department} onValueChange={(value) => setForm({ ...form, department: value })}>
                <SelectTrigger id="department" className="mt-2 border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 截止时间 */}
            <div>
              <Label htmlFor="deadline" className="text-gray-700 font-semibold">
                截止时间 *
              </Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="mt-2 border-gray-300 focus:border-emerald-500"
              />
            </div>

            {/* 允许迟交 */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Checkbox
                id="allow_late"
                checked={form.allow_late}
                onCheckedChange={(checked) => setForm({ ...form, allow_late: checked as boolean })}
              />
              <Label htmlFor="allow_late" className="text-gray-700 cursor-pointer">
                允许学生迟交作业
              </Label>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setLocation('/')}
                className="flex-1"
              >
                取消
              </Button>
              <Button
                onClick={handlePublish}
                disabled={loading}
                className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Send className="w-4 h-4" />
                {loading ? '发布中...' : '发布作业'}
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
