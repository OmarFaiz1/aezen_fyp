import { IntegrationCard } from '../integration-card';

export default function IntegrationCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <IntegrationCard
        name="WhatsApp"
        description="Connect WhatsApp Business API for customer messaging"
        icon="📱"
        connected={true}
        onToggle={(enabled) => console.log('WhatsApp toggled:', enabled)}
        onConfigure={() => console.log('Configure WhatsApp')}
      />
      <IntegrationCard
        name="Instagram"
        description="Integrate Instagram Direct Messages"
        icon="📷"
        connected={false}
        onToggle={(enabled) => console.log('Instagram toggled:', enabled)}
        onConfigure={() => console.log('Configure Instagram')}
      />
    </div>
  );
}