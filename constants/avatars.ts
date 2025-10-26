// constants/avatars.ts
import icon1 from "@/assets/images/icon/avatar1.png";
import icon2 from "@/assets/images/icon/avatar2.png";
import icon3 from "@/assets/images/icon/avatar3.png";
import icon4 from "@/assets/images/icon/avatar4.png";
import icon5 from "@/assets/images/icon/avatar5.png";

export const avatarMap: Record<string, any> = {
  avatar1: icon1,
  avatar2: icon2,
  avatar3: icon3,
  avatar4: icon4,
  avatar5: icon5,
};

// optional: provide a default fallback
export const defaultAvatar = icon1;
