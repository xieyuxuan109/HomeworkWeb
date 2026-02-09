import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/lib/store';
import { homeworkAPI } from '@/lib/api';
import { toast } from 'sonner';
import { LogOut, Plus, BookOpen } from 'lucide-react';

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuthStore();
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setLocation('/login');
      return;
    }
    fetchHomeworks();
  }, [user]);

  const fetchHomeworks = async () => {
    setLoading(true);
    try {
      const response: any = await homeworkAPI.getList();
      if (response?.code === 0) {
        setHomeworks(response.data.list || []);
      } else {
        toast.error('获取作业列表失败');
      }
    } catch (error) {
      toast.error('获取作业列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  const handleViewHomework = (id: number) => {
    setLocation(`/homework/${id}`);
  };

  const handlePublishHomework = () => {
    setLocation('/publish');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-emerald-600" />
            <h1 className="text-2xl font-bold text-gray-900">作业管理系统</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.nickname}</p>
              <p className="text-xs text-gray-500">{user?.department_label}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              退出
            </Button>
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 头部操作栏 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {user?.role === 'admin' ? '作业管理' : '作业列表'}
            </h2>
            <p className="text-gray-500 mt-1">
              {user?.role === 'admin'
                ? '发布和管理班级作业'
                : '查看和提交作业'}
            </p>
          </div>
          {user?.role === 'admin' && (
            <Button
              onClick={handlePublishHomework}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4" />
              发布作业
            </Button>
          )}
        </div>

        {/* 作业列表 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-500 mt-4">加载中...</p>
          </div>
        ) : homeworks.length === 0 ? (
          <Card className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无作业</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {homeworks.map((homework) => (
              <Card
                key={homework.id}
                className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                onClick={() => handleViewHomework(homework.id)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">
                      {homework.title}
                    </h3>
                    <span className="text-xs font-medium px-2 py-1 bg-emerald-100 text-emerald-700 rounded">
                      {homework.department_label}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {homework.description}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>截止时间：</span>
                      <span className="font-medium">
                        {new Date(homework.deadline).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>提交数：</span>
                      <span className="font-medium">{homework.submission_count}</span>
                    </div>
                    {homework.allow_late && (
                      <div className="text-emerald-600 text-xs">
                        ✓ 允许迟交
                      </div>
                    )}
                  </div>

                  <Button
                    className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewHomework(homework.id);
                    }}
                  >
                    {user?.role === 'admin' ? '管理' : '查看详情'}
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
