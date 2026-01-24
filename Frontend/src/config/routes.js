import React from "react";

import Start from "../pages/Landing/Start";
import Signup from "../pages/Auth/Signup";
import EmailAuth from "../pages/Auth/EmailAuth";
import OtpVerify from "../pages/Auth/OtpVerify";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import AuthCallback from "../pages/Auth/AuthCallback";
import RequireAuthLayout from "../layouts/RequireAuthLayout";
import AuthedShellLayout from "../layouts/AuthedShellLayout";
import Step1FullName from "../pages/Onboarding/Step1FullName";
import Step2Gender from "../pages/Onboarding/Step2Gender";
import Step3Tall from "../pages/Onboarding/Step3Tall";
import Step4Weight from "../pages/Onboarding/Step4Weight";
import Step5Experience from "../pages/Onboarding/Step5Experience";
import Step6Regularity from "../pages/Onboarding/Step6Regularity";
import Step7Goal from "../pages/Onboarding/Step7Goal";
import Step8Training from "../pages/Onboarding/Step8Training";
import OnboardingDone from "../pages/Onboarding/Done";
import Home from "../pages/Site/Home";

//Running
import NewRun from "../pages/Running/NewRun";
import OutdoorRun from "../pages/Running/OutdoorRun";

import SettingRunning from "../pages/Setting/SettingRunning";

import StatsPage from "../pages/Statistics/StatsPage";

// AI Chat
import AIChat from "../pages/AIChat/AIChat";

import ROUTE_PATH from "../constants/routePath";




const AppRoutes = [
	{ path: ROUTE_PATH.ROOT, page: Start },
	{ path: ROUTE_PATH.SIGNUP, page: Signup },
	{ path: ROUTE_PATH.SIGNIN, page: EmailAuth },
	{ path: ROUTE_PATH.EMAIL, page: EmailAuth },
	{ path: ROUTE_PATH.OTP, page: OtpVerify },
	{ path: ROUTE_PATH.FORGOT_PASSWORD, page: ForgotPassword },
	{ path: ROUTE_PATH.AUTH_CALLBACK, page: AuthCallback },
	{ path: ROUTE_PATH.HOME, page: Home, layout: AuthedShellLayout },

	{ path: ROUTE_PATH.ONBOARDING, page: Step1FullName, layout: RequireAuthLayout },
	{ path: ROUTE_PATH.ONBOARDING_STEP_1, page: Step1FullName, layout: RequireAuthLayout },
	{ path: ROUTE_PATH.ONBOARDING_STEP_2, page: Step2Gender, layout: RequireAuthLayout },
	{ path: ROUTE_PATH.ONBOARDING_STEP_3, page: Step3Tall, layout: RequireAuthLayout },
	{ path: ROUTE_PATH.ONBOARDING_STEP_4, page: Step4Weight, layout: RequireAuthLayout },
	{ path: ROUTE_PATH.ONBOARDING_STEP_5, page: Step5Experience, layout: RequireAuthLayout },
	{ path: ROUTE_PATH.ONBOARDING_STEP_6, page: Step6Regularity, layout: RequireAuthLayout },
	{ path: ROUTE_PATH.ONBOARDING_STEP_7, page: Step7Goal, layout: RequireAuthLayout },
	{ path: ROUTE_PATH.ONBOARDING_STEP_8, page: Step8Training, layout: RequireAuthLayout },
	{ path: ROUTE_PATH.ONBOARDING_DONE, page: OnboardingDone, layout: RequireAuthLayout },

	//Running
	{ path: ROUTE_PATH.NEW_RUN, page: NewRun, layout: AuthedShellLayout },
	{ path: ROUTE_PATH.OUTDOOR_RUN, page: OutdoorRun, layout: AuthedShellLayout },

	// Settings
	{ path: ROUTE_PATH.SETTING_RUNNING, page: SettingRunning, layout: AuthedShellLayout },

	// Statistics
	{ path: ROUTE_PATH.STATISTICS, page: StatsPage, layout: AuthedShellLayout },

	// AI Chat (full screen, no layout)
	{ path: ROUTE_PATH.AI_CHAT, page: AIChat },
]

export { AppRoutes };

export default AppRoutes;