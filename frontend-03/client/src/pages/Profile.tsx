import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/lib/store';
import { userAPI } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft, LogOut, Trash2 } from 'lucide-react';

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error('请输入密码确认删除');
      return;
    }

    if (!window.confirm('确定要删除账户吗？此操作不可撤销。')) {
      return;
    }

    setDeleting(true);
    try {
      const response: any = await userAPI.deleteAccount(deletePassword);
      if (response?.code === 0) {
        toast.success('账户已删除');
        logout();
        setLocation('/login');
      } else {
        toast.error(response?.message || '删除失败');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '删除失败');
    } finally {
      setDeleting(false);
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
          {/* 左侧：用户信息 */}
          <div className="col-span-2">
            <Card className="p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">个人信息</h2>

              <div className="space-y-6">
                <div>
                  <Label className="text-gray-700 font-semibold">用户名</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-900">{user?.username}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-700 font-semibold">昵称</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-900">{user?.nickname}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-700 font-semibold">部门</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-900">{user?.department_label}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-700 font-semibold">角色</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      user?.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user?.role === 'admin' ? '教师' : '学生'}
                    </span>
                  </div>
                </div>

                {user?.email && (
                  <div>
                    <Label className="text-gray-700 font-semibold">邮箱</Label>
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* 右侧：操作 */}
          <div>
            <Card className="p-6 sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">账户操作</h3>

              <div className="space-y-3">
                <Button
                  onClick={handleLogout}
                  className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <LogOut className="w-4 h-4" />
                  退出登录
                </Button>
              </div>
            </Card>

            {/* 删除账户 */}
            <Card className="p-6 mt-6 border-red-200 bg-red-50">
              <h3 className="text-lg font-bold text-red-900 mb-4">危险区域</h3>

              <div className="space-y-3">
                <p className="text-sm text-red-700">
                  删除账户是不可逆的操作，请谨慎选择。
                </p>

                <div>
                  <Label htmlFor="delete-password" className="text-red-700 text-sm">
                    输入密码确认删除
                  </Label>
                  <Input
                    id="delete-password"
                    type="password"
                    placeholder="输入密码"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="mt-2 border-red-300 focus:border-red-500"
                  />
                </div>

                <Button
                  onClick={handleDeleteAccount}
                  disabled={deleting || !deletePassword}
                  variant="destructive"
                  className="w-full gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {deleting ? '删除中...' : '删除账户'}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
