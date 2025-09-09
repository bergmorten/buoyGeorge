from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class Debug(_message.Message):
    __slots__ = ("seconds_2025", "iridium_start_tts", "iridium_prev_message_transfer_time", "iridium_signal_strength", "gnss_time_to_first_fix", "gnss_num_satellites", "gnss_signal_strengths", "gnss_lat", "gnss_lon", "gnss_alt")
    SECONDS_2025_FIELD_NUMBER: _ClassVar[int]
    IRIDIUM_START_TTS_FIELD_NUMBER: _ClassVar[int]
    IRIDIUM_PREV_MESSAGE_TRANSFER_TIME_FIELD_NUMBER: _ClassVar[int]
    IRIDIUM_SIGNAL_STRENGTH_FIELD_NUMBER: _ClassVar[int]
    GNSS_TIME_TO_FIRST_FIX_FIELD_NUMBER: _ClassVar[int]
    GNSS_NUM_SATELLITES_FIELD_NUMBER: _ClassVar[int]
    GNSS_SIGNAL_STRENGTHS_FIELD_NUMBER: _ClassVar[int]
    GNSS_LAT_FIELD_NUMBER: _ClassVar[int]
    GNSS_LON_FIELD_NUMBER: _ClassVar[int]
    GNSS_ALT_FIELD_NUMBER: _ClassVar[int]
    seconds_2025: int
    iridium_start_tts: int
    iridium_prev_message_transfer_time: int
    iridium_signal_strength: int
    gnss_time_to_first_fix: int
    gnss_num_satellites: int
    gnss_signal_strengths: int
    gnss_lat: float
    gnss_lon: float
    gnss_alt: float
    def __init__(self, seconds_2025: _Optional[int] = ..., iridium_start_tts: _Optional[int] = ..., iridium_prev_message_transfer_time: _Optional[int] = ..., iridium_signal_strength: _Optional[int] = ..., gnss_time_to_first_fix: _Optional[int] = ..., gnss_num_satellites: _Optional[int] = ..., gnss_signal_strengths: _Optional[int] = ..., gnss_lat: _Optional[float] = ..., gnss_lon: _Optional[float] = ..., gnss_alt: _Optional[float] = ...) -> None: ...
