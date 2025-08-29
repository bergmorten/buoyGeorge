from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class Status(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    STATUS_UNSPECIFIED: _ClassVar[Status]
    STATUS_RUNNING: _ClassVar[Status]
    STATUS_HALTED: _ClassVar[Status]
    STATUS_ABORT: _ClassVar[Status]
STATUS_UNSPECIFIED: Status
STATUS_RUNNING: Status
STATUS_HALTED: Status
STATUS_ABORT: Status

class Performance(_message.Message):
    __slots__ = ("seconds_2025", "voltage_100parts", "current_100parts", "temperature_celsius", "uptime_seconds", "ram_percentage_100parts", "cpu_usage_percentage_100parts", "status")
    SECONDS_2025_FIELD_NUMBER: _ClassVar[int]
    VOLTAGE_100PARTS_FIELD_NUMBER: _ClassVar[int]
    CURRENT_100PARTS_FIELD_NUMBER: _ClassVar[int]
    TEMPERATURE_CELSIUS_FIELD_NUMBER: _ClassVar[int]
    UPTIME_SECONDS_FIELD_NUMBER: _ClassVar[int]
    RAM_PERCENTAGE_100PARTS_FIELD_NUMBER: _ClassVar[int]
    CPU_USAGE_PERCENTAGE_100PARTS_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    seconds_2025: int
    voltage_100parts: int
    current_100parts: int
    temperature_celsius: int
    uptime_seconds: int
    ram_percentage_100parts: int
    cpu_usage_percentage_100parts: int
    status: Status
    def __init__(self, seconds_2025: _Optional[int] = ..., voltage_100parts: _Optional[int] = ..., current_100parts: _Optional[int] = ..., temperature_celsius: _Optional[int] = ..., uptime_seconds: _Optional[int] = ..., ram_percentage_100parts: _Optional[int] = ..., cpu_usage_percentage_100parts: _Optional[int] = ..., status: _Optional[_Union[Status, str]] = ...) -> None: ...
