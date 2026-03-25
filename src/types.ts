export interface Student {
  id: string;
  name: string;
  fatherName?: string;
  motherName?: string;
  address?: string;
  studentId: string;
  class: string;
  section?: string;
  roll: string;
  group?: string;
  session?: string;
  bloodGroup?: string;
  phone?: string;
  photo?: string; // base64
}

export interface IDTemplate {
  schoolName: string;
  schoolAddress: string;
  schoolLogo?: string; // base64
  principalSignature?: string; // base64
  backgroundImage?: string; // base64
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  schoolNameColor?: string;
  schoolAddressColor?: string;
  leftBarText?: string;
  leftBarColor?: string;
  cardWidth: number; // in mm
  cardHeight: number; // in mm
  expiryDate?: string;
  backPartImage?: string; // base64
  includeBackPart?: boolean;
  backPartPrintCount?: number;
  showSchoolName?: boolean;
  showSchoolAddress?: boolean;
  showSchoolLogo?: boolean;
  showLeftBarText?: boolean;
  // Sizing and Positioning
  schoolNameSize?: number;
  schoolAddressSize?: number;
  photoTopOffset?: number;
  photoSize?: number;
  studentInfoTopOffset?: number;
  studentInfoLeftOffset?: number;
  studentInfoFontSize?: number;
  signatureTopOffset?: number;
  signatureSize?: number;
  principalTextBottomOffset?: number;
  principalFontSize?: number;
  // Watermark
  watermarkImage?: string; // base64
  watermarkSize?: number;
  watermarkOpacity?: number;
  watermarkTopOffset?: number;
  watermarkLeftOffset?: number;
}
