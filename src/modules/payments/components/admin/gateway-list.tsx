import { GatewayCard } from "./gateway-card";
import { getUddoktaPayStatus } from "../../gateways/uddoktapay-config";

export async function GatewayList() {
  const uddoktaPay = await getUddoktaPayStatus();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <GatewayCard
        id="uddoktapay"
        name="UddoktaPay"
        description="বাংলাদেশের সব popular payment method — এক API তে"
        enabled={uddoktaPay.enabled}
        configured={uddoktaPay.configured}
        environment={uddoktaPay.environment}
        apiUrl={uddoktaPay.apiUrl}
        apiKeyMasked={uddoktaPay.apiKeyMasked}
        supports={[
          "bKash",
          "Nagad",
          "Rocket",
          "Upay",
          "Card",
          "Bank Transfer",
          "Mobile Banking",
        ]}
      />
    </div>
  );
}