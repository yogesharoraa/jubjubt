export interface UserDetail {
    status: boolean;
    data: Data;
    message: string;
    toast: boolean;
}

export interface Data {
    Records: Record[];
    Pagination: Pagination;
}

export interface Pagination {
    total_pages: number;
    total_records: number;
    current_page: number;
    records_per_page: number;
}

export interface Record {
    user_name: string;
    email: string;
    profile_pic: string;
    updatedAt: Date;
    user_id: number;
    full_name: string;
    country_code: string;
    country: string;
    gender: string;
    bio: string;
    profile_verification_status: boolean;
    login_verification_status: boolean;
    socket_id: string;
    followingCount: number;
    followerCount: number;
    reportCounts: number;
}


export interface AdminDetail {
    status: boolean;
    data: Data;
    message: string;
    toast: boolean;
}

export interface Data {
    admin_id: number;
    email: string;
    full_name: string;
    first_name: string;
    last_name: string;
    profile_pic: string;
    country: string;
    mobile_number: string;
    gender: string;
    dob: string;
    country_short_name: string;
}


export interface GiftCategory {
    status: boolean;
    data: Data;
    message: string;
    toast: boolean;
}

export interface Data {
    Records: Record[];
    Pagination: Pagination;
}

export interface Pagination {
    total_pages: number;
    total_records: number;
    current_page: number;
    records_per_page: number;
}

export interface Record {
    gift_category_id: number;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    uploader_id: number;
}











export interface GiftList {
    status: boolean;
    data: Data;
    message: string;
    toast: boolean;
}

export interface Data {
    Records: Record[];
    Pagination: Pagination;
}

export interface Pagination {
    total_pages: number;
    total_records: number;
    current_page: number;
    records_per_page: number;
}

export interface Record {
    gift_thumbnail: string;
    gift_id: number;
    name: RecordName;
    gift_value: number;
    total_use: number;
    createdAt: Date;
    updatedAt: Date;
    uploader_id: number;
    gift_category_id: number;
    Gift_category: GiftCategory;
}

export interface GiftCategory {
    gift_category_id: number;
    name: GiftCategoryName;
    createdAt: Date;
    updatedAt: Date;
    uploader_id: number;
}

export enum GiftCategoryName {
    NavratriDemo = "NavratriDemo",
}

export enum RecordName {
    Clock = "Clock",
    Demo = "Demo",
}



//  dashborad

export interface DashboradTotalUser {
    status: boolean;
    data: Data;
    message: string;
    toast: boolean;
}

export interface Data {
    total_counts: User[];
    lastMonth_Count: User[];
}

export interface User {
    user_id: number;
    full_name: string;
    first_name: string;
    last_name: string;
    user_name: string | null;
    // add other fields if needed
}



export interface DashboradTotalSocail {
    status: boolean;
    data: Data;
    message: string;
    toast: boolean;
}

export interface Data {
    total_counts: User[];
    lastMonth_Count: User[];
}

export interface User {
    user_id: number;
    full_name: string;
    first_name: string;
    last_name: string;
    user_name: string | null;
}



export interface DashboradPlatFomrActivity {
    status: boolean;
    data: Datum[];
    message: string;
    toast: boolean;
}

export interface Datum {
    platform: string;
    count: number;
}



export interface DashboradLive {
    status: boolean;
    data: Datum[];
    message: string;
    toast: boolean;
}

export interface Datum {
    platform: string;
    count: number;
}



export interface DashboradEarning {
    status: boolean;
    data: EarningData;
    message: string;
    toast: boolean;
}

export interface EarningData {
    total_income: number;
    lastMonth_income: number;
    total_count: number;
    lastMonth_Count: number;
}


export interface DashboradLogintype {
    status: boolean;
    data: Data;
    message: string;
    toast: boolean;
}

export interface Data {
    email_count: number;
    phone_count: number;
    social_count: number;
}



// types/gift.ts
export interface GiftUpdate {
    gift_id: number;
    gift_category_id: number;
    name: string;
    gift_value: number;
    total_use: number;
    gift_thumbnail: string;
    status: boolean;
    createdAt: string;
    updatedAt: string;
    uploader_id: number;
}



// types/user.ts
export interface User {
    user_name: string | null;
    email: string;
    profile_pic: string;
    updatedAt: string;
    user_id: number;
    full_name: string;
    country_code: string;
    country: string;
    gender: string;
    bio: string;
    profile_verification_status: boolean;
    login_verification_status: boolean;
    socket_id: string;
    login_type: string;
    blocked_by_admin: boolean;
    followingCount: number;
    followerCount: number;
    reportCounts: number;
}



export interface DashBoardSettingValues {
    status: boolean;
    data: Data;
    message: string;
    toast: boolean;
}

export interface Data {
    app_logo_light: string;
    app_logo_dark: string;
    splash_image: string;
    one_signal_app_id: string;
    one_signal_api_key: string;
    web_logo_light: string;
    web_logo_dark: string;
    twilio_account_sid: string;
    twilio_auth_token: string;
    msg_91_auth_key: string;
    msg_91_private_key: string;
    msg_91_template_id:string;
    twilio_phone_number: string;
    password: string;
    email_banner: string;
    config_id: number;
    phone_authentication: boolean;
    email_authentication: boolean;
    maximum_members_in_group: number;
    show_all_contatcts: boolean;
    show_phone_contatcs: boolean;
    app_name: string;
    app_email: string;
    app_text: string;
    app_primary_color: string;
    app_secondary_color: string;
    app_ios_link: string;
    app_android_link: string;
    app_tell_a_friend_text: string;
    email_service: string;
    smtp_host: string;
    email: string;
    email_port: string;
    email_title: string;
    purchase_code: string;
    copyright_text: string;
    privacy_policy: string;
    terms_and_conditions: string;
    delete_account: string;
    s3_region: string;
    s3_access_key_id: string;
    s3_secret_access_key: string;
    s3_bucket_name: string;
    mediaflow: string;
    stripe: string;
    stripe_public_key: string;
    stripe_secret_key: string;
    gpay_merch_id: string;
    gpay_merch_name: string;
    gpay_country_code: string;
    gpay_currency_code: string;
    gpay: string;
    apple_pay: string;
    apple_pay_merch_id: string;
    apple_pay_merch_name: string;
    apple_pay_country_code: string;
    apple_pay_currency_code: string;
    paypal: string;
    paypal_public_key: string;
    paypal_secret_key: string;
    google_login_authentication:string;
    apple_login_authentication:string;
    android_channel_id:string;
    createdAt: Date;
    updatedAt: Date;
}













