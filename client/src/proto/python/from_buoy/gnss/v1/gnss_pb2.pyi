from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class Location(_message.Message):
    __slots__ = ("seconds2025", "latitude", "longitude", "quality", "number_of_satellites")
    SECONDS2025_FIELD_NUMBER: _ClassVar[int]
    LATITUDE_FIELD_NUMBER: _ClassVar[int]
    LONGITUDE_FIELD_NUMBER: _ClassVar[int]
    QUALITY_FIELD_NUMBER: _ClassVar[int]
    NUMBER_OF_SATELLITES_FIELD_NUMBER: _ClassVar[int]
    seconds2025: int
    latitude: float
    longitude: float
    quality: int
    number_of_satellites: int
    def __init__(self, seconds2025: _Optional[int] = ..., latitude: _Optional[float] = ..., longitude: _Optional[float] = ..., quality: _Optional[int] = ..., number_of_satellites: _Optional[int] = ...) -> None: ...
