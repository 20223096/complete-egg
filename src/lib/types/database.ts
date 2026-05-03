export type UserRole = "traveler" | "host" | "admin";

export type RequestStatus = "open" | "quoted" | "accepted" | "closed" | "canceled";

export type AccommodationType =
  | "pension"
  | "poolvilla"
  | "hotel"
  | "guesthouse"
  | "hanok"
  | "any";

export type AccommodationListingStatus = "active" | "inactive";

export type QuoteStatus = "sent" | "accepted" | "rejected" | "expired" | "canceled";

export type ReservationStatus = "payment_pending" | "confirmed" | "canceled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type SubscriptionPlan = "free" | "pro";

export interface Profile {
  id: string;
  role: UserRole;
  name: string;
  phone: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface TravelerRequest {
  id: string;
  traveler_id: string;
  traveler_name: string | null;
  region: string;
  detail_region: string | null;
  check_in_date: string;
  check_out_date: string;
  people_count: number;
  room_count: number | null;
  budget_min: number | null;
  budget_max: number | null;
  accommodation_type: AccommodationType | string;
  required_options: string[];
  preferred_mood: string[];
  message: string | null;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
}

export interface Accommodation {
  id: string;
  host_id: string;
  name: string;
  region: string;
  detail_region: string | null;
  address: string | null;
  description: string | null;
  accommodation_type: string | null;
  base_price: number | null;
  max_people: number | null;
  images: string[];
  options: string[];
  check_in_time: string | null;
  check_out_time: string | null;
  phone: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

export interface Quote {
  id: string;
  request_id: string;
  traveler_id: string;
  host_id: string;
  accommodation_id: string | null;
  accommodation_name: string | null;
  title: string;
  price: number;
  original_price: number | null;
  discount_rate: number | null;
  check_in_date: string | null;
  check_out_date: string | null;
  people_count: number | null;
  included_options: string[];
  message_from_host: string | null;
  cancellation_policy: string | null;
  status: QuoteStatus;
  is_auto_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  id: string;
  request_id: string;
  quote_id: string;
  traveler_id: string;
  host_id: string;
  accommodation_id: string | null;
  price: number;
  status: ReservationStatus;
  payment_status: PaymentStatus;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  reservation_id: string;
  traveler_id: string;
  host_id: string;
  quote_id: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: "traveler" | "host";
  text: string;
  created_at: string;
}

export interface HostSubscription {
  id: string;
  host_id: string;
  plan: SubscriptionPlan;
  status: string | null;
  started_at: string;
  ended_at: string | null;
}

export interface AutoQuoteRule {
  id: string;
  host_id: string;
  accommodation_id: string | null;
  enabled: boolean;
  regions: string[];
  min_budget: number | null;
  max_budget: number | null;
  min_people: number | null;
  max_people: number | null;
  available_options: string[];
  base_message: string | null;
  discount_policy: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuoteWithAccommodation extends Quote {
  accommodation?: Pick<Accommodation, "images" | "region" | "detail_region"> | null;
}
