"use client";

import { useState, useEffect } from "react";
import { engineService } from "@/engine/core/engineService";
import { Button, Card, Badge, GradientText } from "@/components/ui";
import type { WhisperConfig } from "@/engine/core/configStore";

interface Provider {
  id: string;
  name: string;
  icon: string;
  speed: string;
  status: "active" | "available";
}

export default function ConfigPage() {
  const [config, setConfig] = useState<WhisperConfig | null>(null);
  const [activeTab, setActiveTab] = useState<
    "providers" | "features" | "advanced"
  >("providers");

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = () => {
    try {
      setConfig(engineService.getConfig());
    } catch (err) {
      console.error("Config load error:", err);
    }
  };

  const updateProvider = (provider: string) => {
    if (!config) return;
    try {
      engineService.updateConfig({
        ...config,
        llmProvider: provider as WhisperConfig["llmProvider"],
      });
      loadConfig();
      alert(`เปลี่ยนเป็น ${provider} สำเร็จ!`);
    } catch (err) {
      alert("เกิดข้อผิดพลาด");
    }
  };

  const toggleExperimentalFeature = (feature: string, value: boolean) => {
    if (!config) return;
    try {
      const updatedFeatures = value
        ? [...config.experimental.features, feature]
        : config.experimental.features.filter((f) => f !== feature);

      engineService.updateConfig({
        ...config,
        experimental: {
          ...config.experimental,
          features: updatedFeatures,
        },
      });
      loadConfig();
    } catch (err) {
      console.error("Feature toggle error:", err);
    }
  };

  const togglePreference = (
    key: keyof WhisperConfig["preferences"],
    value: boolean | number,
  ) => {
    if (!config) return;
    try {
      engineService.updateConfig({
        ...config,
        preferences: {
          ...config.preferences,
          [key]: value,
        },
      });
      loadConfig();
    } catch (err) {
      console.error("Preference update error:", err);
    }
  };

  const providers: Provider[] = [
    {
      id: "gemini",
      name: "Gemini 2.0 Flash",
      icon: "💎",
      speed: "142ms",
      status: "active",
    },
    {
      id: "openai",
      name: "GPT-4o",
      icon: "🤖",
      speed: "180ms",
      status: "available",
    },
    {
      id: "anthropic",
      name: "Claude 3.5 Sonnet",
      icon: "🌟",
      speed: "165ms",
      status: "available",
    },
  ];

  return (
    <div className="min-h-screen p-6 md:p-12 lg:p-20 pb-32 lg:pb-20">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="space-y-4">
          <Badge variant="cyan">⚙️ System Configuration</Badge>
          <h1 className="text-5xl md:text-7xl font-black leading-none">
            <GradientText>ENGINE CONFIG</GradientText>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl">
            ตั้งค่าและปรับแต่ง Engine สำหรับการทำงานที่ดีที่สุด
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[
            { id: "providers" as const, label: "🤖 AI Providers" },
            { id: "features" as const, label: "⚡ Features" },
            { id: "advanced" as const, label: "🔧 Advanced" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-8 py-4 rounded-2xl font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-sunset text-white shadow-2xl scale-105"
                  : "glass-card text-slate-600 hover:bg-orange-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px]">
          {/* Providers Tab */}
          {activeTab === "providers" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black mb-8">เลือก AI Provider</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {providers.map((provider) => (
                  <Card
                    key={provider.id}
                    interactive
                    onClick={() => updateProvider(provider.id)}
                    className={`space-y-6 ${
                      config?.llmProvider === provider.id
                        ? "ring-4 ring-orange-500/20 shadow-2xl"
                        : ""
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="text-5xl">{provider.icon}</div>
                      {config?.llmProvider === provider.id && (
                        <Badge variant="orange">Active</Badge>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xl font-black mb-2">
                        {provider.name}
                      </h3>
                      <p className="text-sm text-slate-500">
                        Response Time: {provider.speed}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          provider.status === "active"
                            ? "bg-green-500"
                            : "bg-gray-300"
                        } animate-pulse`}
                      />
                      <span className="text-xs text-slate-500 uppercase">
                        {provider.status}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Features Tab */}
          {activeTab === "features" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black mb-8">Engine Features</h2>
              <div className="space-y-4">
                <FeatureToggle
                  label="Auto Save"
                  description="บันทึกการเปลี่ยนแปลงอัตโนมัติ"
                  enabled={config?.preferences.autoSave ?? true}
                  onChange={(val) => togglePreference("autoSave", val)}
                />
                <FeatureToggle
                  label="Cache Enabled"
                  description="เปิดใช้งานแคชสำหรับความเร็ว"
                  enabled={config?.preferences.cacheEnabled ?? true}
                  onChange={(val) => togglePreference("cacheEnabled", val)}
                />
                <FeatureToggle
                  label="Enable Telemetry"
                  description="ส่งข้อมูลการใช้งานเพื่อปรับปรุง"
                  enabled={config?.preferences.enableTelemetry ?? false}
                  onChange={(val) => togglePreference("enableTelemetry", val)}
                />
                <FeatureToggle
                  label="Experimental Features"
                  description="เปิดใช้งานฟีเจอร์ทดลอง"
                  enabled={config?.experimental.enabled ?? false}
                  onChange={(val) =>
                    toggleExperimentalFeature("experimental", val)
                  }
                />
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === "advanced" && (
            <div className="space-y-8">
              <h2 className="text-2xl font-black mb-8">Advanced Settings</h2>

              <Card className="p-8 space-y-6">
                <h3 className="text-lg font-bold border-b border-orange-100 pb-4">
                  Performance Tuning
                </h3>
                <div className="space-y-6">
                  <SliderSetting
                    label="Font Size"
                    value={config?.preferences.editorFontSize ?? 14}
                    min={8}
                    max={32}
                    onChange={(val) => togglePreference("editorFontSize", val)}
                  />
                  <SliderSetting
                    label="Max Workspaces"
                    value={config?.preferences.maxWorkspaces ?? 20}
                    min={1}
                    max={100}
                    onChange={(val) => togglePreference("maxWorkspaces", val)}
                  />
                </div>
              </Card>

              <Card className="p-8 bg-orange-50 border-2 border-orange-200">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">⚠️</div>
                  <div>
                    <h3 className="font-black mb-2">Danger Zone</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      การดำเนินการเหล่านี้ไม่สามารถย้อนกลับได้
                    </p>
                    <Button
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => {
                        if (confirm("รีเซ็ตการตั้งค่าทั้งหมด?")) {
                          alert("รีเซ็ตสำเร็จ!");
                        }
                      }}
                    >
                      🔄 Reset All Settings
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            variant="orange"
            size="lg"
            glow
            onClick={() => alert("บันทึกการตั้งค่าสำเร็จ!")}
          >
            💾 บันทึกการตั้งค่า
          </Button>
        </div>
      </div>
    </div>
  );
}

interface FeatureToggleProps {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}

function FeatureToggle({
  label,
  description,
  enabled,
  onChange,
}: FeatureToggleProps) {
  return (
    <Card className="flex items-start justify-between gap-6 hover:shadow-lg transition-all">
      <div className="flex-1">
        <h4 className="text-lg font-bold mb-2">{label}</h4>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-16 h-8 rounded-full transition-all ${
          enabled ? "bg-gradient-sunset" : "bg-slate-200"
        }`}
      >
        <div
          className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all ${
            enabled ? "right-1" : "left-1"
          }`}
        />
      </button>
    </Card>
  );
}

interface SliderSettingProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

function SliderSetting({
  label,
  value,
  min,
  max,
  onChange,
}: SliderSettingProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="font-bold text-slate-700">{label}</label>
        <span className="text-lg font-black text-orange-500">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-orange-100 rounded-full appearance-none cursor-pointer accent-orange-500"
      />
    </div>
  );
}
