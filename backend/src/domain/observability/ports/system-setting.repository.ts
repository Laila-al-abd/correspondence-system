import { Repository } from "../../shared/repository"
import { SystemSetting } from "../system-setting"

export interface SystemSettingRepository extends Repository<SystemSetting> {
  findByKey(key: string): Promise<SystemSetting | null>
}
