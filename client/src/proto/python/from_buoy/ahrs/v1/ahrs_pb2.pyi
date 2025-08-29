from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class Recording(_message.Message):
    __slots__ = ("seconds2025", "gyro_x_10parts", "gyro_y_10parts", "gyro_z_10parts", "accel_x_100parts", "accel_y_100parts", "accel_z_100parts", "mag_x_10parts", "mag_y_10parts", "mag_z_10parts", "temperature_10parts", "pressure_100parts", "heading_100parts", "pitch_100parts", "roll_100parts", "yaw_100parts")
    SECONDS2025_FIELD_NUMBER: _ClassVar[int]
    GYRO_X_10PARTS_FIELD_NUMBER: _ClassVar[int]
    GYRO_Y_10PARTS_FIELD_NUMBER: _ClassVar[int]
    GYRO_Z_10PARTS_FIELD_NUMBER: _ClassVar[int]
    ACCEL_X_100PARTS_FIELD_NUMBER: _ClassVar[int]
    ACCEL_Y_100PARTS_FIELD_NUMBER: _ClassVar[int]
    ACCEL_Z_100PARTS_FIELD_NUMBER: _ClassVar[int]
    MAG_X_10PARTS_FIELD_NUMBER: _ClassVar[int]
    MAG_Y_10PARTS_FIELD_NUMBER: _ClassVar[int]
    MAG_Z_10PARTS_FIELD_NUMBER: _ClassVar[int]
    TEMPERATURE_10PARTS_FIELD_NUMBER: _ClassVar[int]
    PRESSURE_100PARTS_FIELD_NUMBER: _ClassVar[int]
    HEADING_100PARTS_FIELD_NUMBER: _ClassVar[int]
    PITCH_100PARTS_FIELD_NUMBER: _ClassVar[int]
    ROLL_100PARTS_FIELD_NUMBER: _ClassVar[int]
    YAW_100PARTS_FIELD_NUMBER: _ClassVar[int]
    seconds2025: int
    gyro_x_10parts: int
    gyro_y_10parts: int
    gyro_z_10parts: int
    accel_x_100parts: int
    accel_y_100parts: int
    accel_z_100parts: int
    mag_x_10parts: int
    mag_y_10parts: int
    mag_z_10parts: int
    temperature_10parts: int
    pressure_100parts: int
    heading_100parts: int
    pitch_100parts: int
    roll_100parts: int
    yaw_100parts: int
    def __init__(self, seconds2025: _Optional[int] = ..., gyro_x_10parts: _Optional[int] = ..., gyro_y_10parts: _Optional[int] = ..., gyro_z_10parts: _Optional[int] = ..., accel_x_100parts: _Optional[int] = ..., accel_y_100parts: _Optional[int] = ..., accel_z_100parts: _Optional[int] = ..., mag_x_10parts: _Optional[int] = ..., mag_y_10parts: _Optional[int] = ..., mag_z_10parts: _Optional[int] = ..., temperature_10parts: _Optional[int] = ..., pressure_100parts: _Optional[int] = ..., heading_100parts: _Optional[int] = ..., pitch_100parts: _Optional[int] = ..., roll_100parts: _Optional[int] = ..., yaw_100parts: _Optional[int] = ...) -> None: ...
