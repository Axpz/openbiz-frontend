"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "@/lib/api/axios"
import { Header } from "@/components/header";
import { Plan } from "@/lib/types";
import { PaymentDialog } from "@/components/payment/payment-dialog";

// 添加微信JSAPI类型定义
declare global {
  interface Window {
    WeixinJSBridge: {
      invoke(
        api: string,
        config: {
          appId: string;
          timeStamp: string;
          nonceStr: string;
          package: string;
          signType: string;
          paySign: string;
        },
        callback: (res: { err_msg: string }) => void
      ): void;
    };
  }
}

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.get<{plans: Plan[]}>('/api/pricing/plans/active');
        setPlans(response.data.plans);
      } catch (err) {
        setError('Failed to fetch plans: ' + (err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handlePurchase = (plan: Plan) => {
    setSelectedPlan(plan);
    setPaymentDialogOpen(true);
  };

  if (loading) {
    return (
      <>
        <Header hideSearch />
        <div className="flex justify-center items-center min-h-screen">Loading...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header hideSearch />
        <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>
      </>
    );
  }

  return (
    <>
      <Header hideSearch />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">会员套餐</h1>
          <p className="text-lg text-muted-foreground">
            选择最适合您的会员套餐，享受更多下载权限和专属服务
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">¥{(plan.price_cents / 100).toFixed(2)}</span>
                </div>
                <CardDescription className="mt-2 text-base text-red-500">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex justify-center w-full">
                <Button 
                  className="bg-blue-500 hover:bg-blue-600 text-white" 
                  variant="default"
                  onClick={() => handlePurchase(plan)}
                >
                  立即购买
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {selectedPlan && (
        <PaymentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          plan={selectedPlan}
          onSuccess={() => {
            window.location.href = '/membership/success';
          }}
        />
      )}
    </>
  );
}