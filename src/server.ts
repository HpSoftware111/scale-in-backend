import { App } from '@/app';
import { AuthRoute } from '@routes/auth.route';
import { UserRoute } from '@routes/users.route';
import { AdminRoute } from '@routes/admin.route';
import { SettingsRoute } from './routes/settings.route';
import { FeedbackRoute } from './routes/feedback.route';
import { CommonRoute } from './routes/common.route';
// import { ValidateEnv } from '@utils/validateEnv';

// ValidateEnv();

const app = new App([new UserRoute(), new AuthRoute(), new SettingsRoute(), new FeedbackRoute(), new AdminRoute(), new CommonRoute()]);

app.listen();
