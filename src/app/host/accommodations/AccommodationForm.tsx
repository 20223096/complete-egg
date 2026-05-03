"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { Textarea } from "@/components/Textarea";
import { ACCOMMODATION_TYPE_LABELS } from "@/lib/constants/labels";
import { createAccommodation, updateAccommodation } from "@/lib/actions/accommodations";
import type { Accommodation } from "@/lib/types/database";

export function AccommodationForm({ initial }: { initial?: Accommodation | null }) {
  const router = useRouter();
  const editId = initial?.id;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(initial?.name ?? "");
  const [region, setRegion] = useState(initial?.region ?? "");
  const [detailRegion, setDetailRegion] = useState(initial?.detail_region ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [accommodationType, setAccommodationType] = useState(initial?.accommodation_type ?? "pension");
  const [basePrice, setBasePrice] = useState(initial?.base_price ?? 150000);
  const [maxPeople, setMaxPeople] = useState(initial?.max_people ?? 4);
  const [imagesText, setImagesText] = useState((initial?.images ?? []).join("\n"));
  const [optionsText, setOptionsText] = useState((initial?.options ?? []).join(", "));
  const [checkInTime, setCheckInTime] = useState(initial?.check_in_time ?? "15:00");
  const [checkOutTime, setCheckOutTime] = useState(initial?.check_out_time ?? "11:00");
  const [phone, setPhone] = useState(initial?.phone ?? "");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const images = imagesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const options = optionsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const payload = {
      name,
      region,
      detail_region: detailRegion,
      address,
      description,
      accommodation_type: accommodationType,
      base_price: basePrice,
      max_people: maxPeople,
      images,
      options,
      check_in_time: checkInTime,
      check_out_time: checkOutTime,
      phone,
    };
    const res = editId ? await updateAccommodation(editId, payload) : await createAccommodation(payload);
    setLoading(false);
    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }
    router.push("/host");
    router.refresh();
  }

  return (
    <form className="mx-auto max-w-xl space-y-4" onSubmit={onSubmit}>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Input label="숙소 이름" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input label="지역" value={region} onChange={(e) => setRegion(e.target.value)} required />
      <Input label="상세 지역" value={detailRegion} onChange={(e) => setDetailRegion(e.target.value)} />
      <Input label="주소" value={address} onChange={(e) => setAddress(e.target.value)} />
      <Textarea label="소개" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
      <Select label="유형" value={accommodationType} onChange={(e) => setAccommodationType(e.target.value)}>
        {Object.entries(ACCOMMODATION_TYPE_LABELS).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </Select>
      <Input label="기준가(원)" type="number" value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value))} />
      <Input label="최대 인원" type="number" value={maxPeople} onChange={(e) => setMaxPeople(Number(e.target.value))} />
      <Textarea
        label="이미지 URL (줄바꿈으로 여러 장)"
        value={imagesText}
        onChange={(e) => setImagesText(e.target.value)}
        rows={3}
      />
      <Input label="옵션(쉼표 구분)" value={optionsText} onChange={(e) => setOptionsText(e.target.value)} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="체크인" value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} />
        <Input label="체크아웃" value={checkOutTime} onChange={(e) => setCheckOutTime(e.target.value)} />
      </div>
      <Input label="연락처" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <Button type="submit" loading={loading}>
        {editId ? "수정 저장" : "등록하기"}
      </Button>
    </form>
  );
}
