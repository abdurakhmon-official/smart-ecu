'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { BrandSelector } from './BrandSelector';
import { BrandsPanel } from './BrandsPanel';
import { EmptyHint } from './EmptyHint';
import { EnginesPanel } from './EnginesPanel';
import { GenerationSelector } from './GenerationSelector';
import { GenerationsPanel } from './GenerationsPanel';
import { ModelSelector } from './ModelSelector';
import { ModelsPanel } from './ModelsPanel';

export function AdminVehicleCatalogView() {
  const t = useTranslations('admin.vehicleCatalog');
  const [brandId, setBrandId] = useState<string>();
  const [modelId, setModelId] = useState<string>();
  const [generationId, setGenerationId] = useState<string>();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      <Tabs defaultValue="brands">
        <TabsList>
          <TabsTrigger value="brands">{t('tabs.brands')}</TabsTrigger>
          <TabsTrigger value="models">{t('tabs.models')}</TabsTrigger>
          <TabsTrigger value="generations">{t('tabs.generations')}</TabsTrigger>
          <TabsTrigger value="engines">{t('tabs.engines')}</TabsTrigger>
        </TabsList>

        <TabsContent value="brands">
          <BrandsPanel />
        </TabsContent>

        <TabsContent value="models">
          <BrandSelector value={brandId} onChange={setBrandId} />
          {brandId ? <ModelsPanel brandId={brandId} /> : <EmptyHint text={t('selectBrandFirst')} />}
        </TabsContent>

        <TabsContent value="generations">
          <BrandSelector
            value={brandId}
            onChange={(id) => {
              setBrandId(id);
              setModelId(undefined);
            }}
          />
          {brandId && <ModelSelector brandId={brandId} value={modelId} onChange={setModelId} />}
          {modelId ? <GenerationsPanel modelId={modelId} /> : <EmptyHint text={t('selectModelFirst')} />}
        </TabsContent>

        <TabsContent value="engines">
          <BrandSelector
            value={brandId}
            onChange={(id) => {
              setBrandId(id);
              setModelId(undefined);
              setGenerationId(undefined);
            }}
          />
          {brandId && (
            <ModelSelector
              brandId={brandId}
              value={modelId}
              onChange={(id) => {
                setModelId(id);
                setGenerationId(undefined);
              }}
            />
          )}
          {modelId && <GenerationSelector modelId={modelId} value={generationId} onChange={setGenerationId} />}
          {generationId ? <EnginesPanel generationId={generationId} /> : <EmptyHint text={t('selectGenerationFirst')} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
