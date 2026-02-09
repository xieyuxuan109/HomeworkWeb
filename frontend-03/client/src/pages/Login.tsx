import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { userAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { toast } from 'sonner';

export default function Login() {
  const [, setLocation] = useLocation();
  const { setUser, setTokens } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // 登录表单
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
  });

  // 注册表单
  const [registerForm, setRegisterForm] = useState({
    username: '',
    password: '',
    nickname: '',
    department: 'backend',
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

  const handleLogin = async () => {
    if (!loginForm.username || !loginForm.password) {
      toast.error('请填写用户名和密码');
      return;
    }

    setLoading(true);
    try {
      const response: any = await userAPI.login({
        username: loginForm.username,
        password: loginForm.password,
      });

      if (response?.code === 0) {
        const { access_token, refresh_token, user } = response.data;
        setTokens(access_token, refresh_token);
        setUser(user);
        toast.success('登录成功');
        setLocation('/');
      } else {
        toast.error(response?.message || '登录失败');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '登录失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!registerForm.username || !registerForm.password || !registerForm.nickname) {
      toast.error('请填写所有必填项');
      return;
    }

    setLoading(true);
    try {
      const response: any = await userAPI.register({
        username: registerForm.username,
        password: registerForm.password,
        nickname: registerForm.nickname,
        department: registerForm.department,
      });

      if (response?.code === 0) {
        toast.success('注册成功，请登录');
        setLoginForm({
          username: registerForm.username,
          password: registerForm.password,
        });
      } else {
        toast.error(response?.message || '注册失败');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '注册失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-100 via-emerald-50 to-teal-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <div className="p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-emerald-600 mb-2">
              作业管理系统
            </h1>
            <p className="text-gray-500 text-sm">
              红岩网络工作室
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100">
              <TabsTrigger value="login" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                登录
              </TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                注册
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-username" className="text-gray-700">用户名</Label>
                <Input
                  id="login-username"
                  placeholder="请输入用户名"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-gray-700">密码</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="请输入密码"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <Button
                onClick={handleLogin}
                disabled={loading}
                className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2"
              >
                {loading ? '登录中...' : '登录'}
              </Button>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-username" className="text-gray-700">用户名</Label>
                <Input
                  id="register-username"
                  placeholder="请输入用户名"
                  value={registerForm.username}
                  onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                  className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-nickname" className="text-gray-700">昵称</Label>
                <Input
                  id="register-nickname"
                  placeholder="请输入昵称"
                  value={registerForm.nickname}
                  onChange={(e) => setRegisterForm({ ...registerForm, nickname: e.target.value })}
                  className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password" className="text-gray-700">密码</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="请输入密码"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-department" className="text-gray-700">部门</Label>
                <Select value={registerForm.department} onValueChange={(value) => setRegisterForm({ ...registerForm, department: value })}>
                  <SelectTrigger id="register-department" className="border-gray-300">
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
              <Button
                onClick={handleRegister}
                disabled={loading}
                className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2"
              >
                {loading ? '注册中...' : '注册'}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
}
