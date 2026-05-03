import { AccommodationForm } from "../AccommodationForm";

export default function NewAccommodationPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">숙소 등록</h1>
      <AccommodationForm />
    </div>
  );
}
