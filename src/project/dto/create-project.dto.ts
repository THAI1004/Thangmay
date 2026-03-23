import {Transform} from 'class-transformer'
import {IsNotEmpty, IsOptional, IsPhoneNumber, IsEmail, IsString, MaxLength, IsNumber, IsArray, IsEnum, IsBoolean, IsDateString} from 'class-validator'
export class CreateProjectDto {
  @IsNotEmpty({message: 'Quy trình lắp đặt không được để trống'})
  workflow: number
  @IsNotEmpty({message: 'Tên đầy đủ không được để trống'})
  @MaxLength(255, {message: 'Tên đầy đủ không được vượt quá 255 ký tự'})
  full_name: string
  @IsNotEmpty({message: 'Số điện thoại không được để trống'})
  @IsPhoneNumber('VN', {message: 'Số điện thoại không hợp lệ'})
  number_phone: string
  @IsNotEmpty({message: 'Giá đầy đủ không được để trống'})
  @Transform(({value}) => parseFloat(value))
  @IsNumber({}, {message: 'Giá phải là số'})
  price?: number
  @IsNotEmpty({message: 'Thuế đầy đủ không được để trống'})
  tax?: string
  @IsOptional()
  @Transform(({value}) => (value === '' ? undefined : value))
  @IsEmail({}, {message: 'Email không hợp lệ'})
  @MaxLength(255, {message: 'Email không được vượt quá 255 ký tự'})
  email?: string
  @IsOptional()
  @Transform(({value}) => (value === '' ? undefined : value))
  @IsString({message: 'Địa chỉ phải là chuỗi'})
  address?: string
  @IsNotEmpty({message: 'Mã dự án không được để trống'})
  @IsString({message: 'Mã dự án phải là chuỗi'})
  code_project: string
  @IsOptional()
  @Transform(({value}) => (value === '' ? undefined : value))
  @IsString({message: 'Thông tin sản phẩm phải là chuỗi'})
  infor_product: string
  @IsOptional()
  @Transform(({value}) => (value === '' ? undefined : value))
  @MaxLength(225, {message: 'Mô tả không được vượt quá 225 ký tự'})
  description?: string
  @IsOptional()
  @Transform(({value}) => (value === '' ? undefined : value))
  steps?: string
  @IsOptional()
  @Transform(({value}) => (value === '' ? undefined : value))
  @IsString({message: 'Động cơ phải là chuỗi'})
  dongCo?: string
  @IsOptional()
  @Transform(({value}) => (value === '' ? undefined : value))
  @IsString({message: 'Tủ điện phải là chuỗi'})
  tuDien?: string
  @IsOptional()
  @Transform(({value}) => (value === '' ? undefined : value))
  @IsString({message: 'Cáp tải phải là chuỗi'})
  capTai?: string
  @IsOptional()
  @Transform(({value}) => (value === '' ? undefined : value))
  @IsString({message: 'Công suất phải là chuỗi'})
  congSuat?: string
  @IsOptional()
  @Transform(({value}) => (value === '' ? undefined : value))
  @IsString({message: 'Hố thang phải là chuỗi'})
  hoThang?: string
  @IsOptional()
  @Transform(({value}) => (value === '' ? undefined : value))
  @IsString({message: 'Cabin phải là chuỗi'})
  cabin?: string
  @IsOptional()
  @Transform(({value}) => (value === '' ? undefined : value))
  @IsString({message: 'Cửa phải là chuỗi'})
  cua?: string
  @IsOptional()
  @Transform(({value}) => (value === '' ? undefined : value))
  @IsString({message: 'Hố PIT phải là chuỗi'})
  pit?: string
  @IsOptional()
  @Transform(({value}) => (value === '' ? undefined : value))
  @IsString({message: 'Phòng máy phải là chuỗi'})
  phongMay?: string
  @IsOptional()
  @Transform(({value}) => (value === '' ? undefined : value))
  @IsString({message: 'OH phải là chuỗi'})
  oh?: string
  @IsOptional()
  @IsArray({message: 'Nhân viên chính phải là mảng chuỗi'})
  @IsString({each: true, message: 'Mỗi nhân viên chính phải là chuỗi'})
  staffMain?: string[]
  city: string
  district: string
  ward: string
}
export class CreateProjectMaintenanceDto
 {
  type:string
  @IsNotEmpty({message: 'Tên đầy đủ không được để trống'})
  @MaxLength(255, {message: 'Tên đầy đủ không được vượt quá 255 ký tự'})
  full_name: string
  @IsNotEmpty({message: 'Số điện thoại không được để trống'})
  @IsPhoneNumber('VN', {message: 'Số điện thoại không hợp lệ'})
  number_phone: string
  @IsNotEmpty({message: 'Giá đầy đủ không được để trống'})
  @Transform(({value}) => parseFloat(value))
  @IsNumber({}, {message: 'Giá phải là số'})
  price?: number
  @IsNotEmpty({message: 'Thuế đầy đủ không được để trống'})
  tax?: string
  @IsOptional()
  @Transform(({value}) => (value === '' ? undefined : value))
  @IsEmail({}, {message: 'Email không hợp lệ'})
  @MaxLength(255, {message: 'Email không được vượt quá 255 ký tự'})
  email?: string
  @IsOptional()
  @Transform(({value}) => (value === '' ? undefined : value))
  @IsString({message: 'Địa chỉ phải là chuỗi'})
  address?: string
  @IsNotEmpty({message: 'Mã dự án không được để trống'})
  @IsString({message: 'Mã dự án phải là chuỗi'})
  code_project: string
  @IsOptional()
  @Transform(({value}) => (value === '' ? undefined : value))
  @IsString({message: 'Thông tin sản phẩm phải là chuỗi'})
  infor_product: any
  @IsOptional()
  @Transform(({value}) => (value === '' ? undefined : value))
  @MaxLength(225, {message: 'Mô tả không được vượt quá 225 ký tự'})
  description?: string
  @IsOptional()
  @Transform(({value}) => (value === '' ? undefined : value))
  @IsString({message: 'Động cơ phải là chuỗi'})
  dongCo?: string
  @IsOptional()
  @Transform(({value}) => (value === '' ? undefined : value))
  @IsString({message: 'Tủ điện phải là chuỗi'})
  tuDien?: string
  @IsOptional()
  @Transform(({value}) => (value === '' ? undefined : value))
  @IsString({message: 'Cáp tải phải là chuỗi'})
  capTai?: string
  @IsOptional()
  @Transform(({value}) => (value === '' ? undefined : value))
  @IsString({message: 'Công suất phải là chuỗi'})
  congSuat?: string
  @IsOptional()
  @Transform(({value}) => (value === '' ? undefined : value))
  @IsString({message: 'Hố thang phải là chuỗi'})
  hoThang?: string
  @IsOptional()
  @Transform(({value}) => (value === '' ? undefined : value))
  @IsString({message: 'Cabin phải là chuỗi'})
  cabin?: string
  @IsOptional()
  @Transform(({value}) => (value === '' ? undefined : value))
  @IsString({message: 'Cửa phải là chuỗi'})
  cua?: string
  @IsOptional()
  @Transform(({value}) => (value === '' ? undefined : value))
  @IsString({message: 'Hố PIT phải là chuỗi'})
  pit?: string
  @IsOptional()
  @Transform(({value}) => (value === '' ? undefined : value))
  @IsString({message: 'Phòng máy phải là chuỗi'})
  phongMay?: string
  @IsOptional()
  @Transform(({value}) => (value === '' ? undefined : value))
  @IsString({message: 'OH phải là chuỗi'})
  oh?: string
  @IsOptional()
  @IsArray({message: 'Nhân viên chính phải là mảng chuỗi'})
  @IsString({each: true, message: 'Mỗi nhân viên chính phải là chuỗi'})
  staffMain?: string[]
  city: string
  district: string
  ward: string

  @IsOptional()
  @Transform(({value}) => value === 'true' || value === true)
  @IsBoolean()
  free?: boolean

  @IsOptional()
  @Transform(({value}) => Number(value))
  @IsNumber()
  price_maintenance?: number

  @IsNotEmpty({message: 'Thời gian bắt đầu không được để trống'})
  @IsDateString({}, {message: 'Nhập thời gian bắt đầu hợp lệ'})
  timeStart: string

  @IsNotEmpty({message: 'Thời gian kết thúc không được để trống'})
  @IsDateString({}, {message: 'Nhập thời gian kết thúc hợp lệ'})
  timeEnd: string

  @IsNotEmpty({message: 'Số lần bảo trì không được để trống'})
  @Transform(({value}) => Number(value))
  @IsNumber()
  countMaintenance: number

}
