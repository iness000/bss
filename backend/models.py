from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date
from sqlalchemy.orm import column_property
from sqlalchemy import select, func

db = SQLAlchemy()

# ---------------- USERS ----------------
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    phone = db.Column(db.String(50))
    address = db.Column(db.String(255))
    license_number = db.Column(db.String(100))
    license_expiry = db.Column(db.Date)
    motocycle_model = db.Column(db.String(100))
    motocycle_year = db.Column(db.String(4))
    subscription_plan_id = db.Column(db.Integer, db.ForeignKey('subscription_plans.id'))
    subscription_start = db.Column(db.Date)
    password_hash = db.Column(db.String(255), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    role = db.Column(db.String(50), default='user')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    rfid_cards = db.relationship('RFIDCard', backref='user', lazy=True)
    swaps = db.relationship('Swap', backref='user', lazy=True)
    billings = db.relationship('MonthlyBilling', backref='user', lazy=True)

# ---------------- SUBSCRIPTION PLANS ----------------
class SubscriptionPlan(db.Model):
    __tablename__ = 'subscription_plans'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    monthly_fee = db.Column(db.Float)
    included_ah = db.Column(db.Integer)
    extra_ah_rate = db.Column(db.Float)

    users = db.relationship('User', backref='subscription_plan', lazy=True)

# ---------------- RFID CARDS ----------------
class RFIDCard(db.Model):
    __tablename__ = 'rfid_cards'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    rfid_code = db.Column(db.String(255), unique=True, nullable=False)
    assigned_battery_id = db.Column(db.Integer, db.ForeignKey('batteries.id'), nullable=True)
    issued_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), default='active')

# ---------------- BATTERY HEALTH LOGS ----------------
class BatteryHealthLog(db.Model):
    __tablename__ = 'battery_health_logs'
    id = db.Column(db.Integer, primary_key=True)
    battery_id = db.Column(db.Integer, db.ForeignKey('batteries.id'), nullable=False)
    soh_percent = db.Column(db.Float)
    pack_voltage = db.Column(db.Float)
    cell_voltage_min = db.Column(db.Float)
    cell_voltage_max = db.Column(db.Float)
    cell_voltage_diff = db.Column(db.Float)
    max_temp = db.Column(db.Float)
    ambient_temp = db.Column(db.Float)
    humidity = db.Column(db.Float)
    internal_resist = db.Column(db.Float)
    cycle_count = db.Column(db.Integer)
    error_code = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


# ---------------- BATTERIES ----------------
class Battery(db.Model):
    __tablename__ = 'batteries'
    id = db.Column(db.Integer, primary_key=True)
    station_id = db.Column(db.Integer, db.ForeignKey('stations.id'))
    status = db.Column(db.String(50), nullable=False)  # e.g., 'available', 'in_use', 'charging'
    serial_number = db.Column(db.String(255), unique=True, nullable=False)
    battery_type = db.Column(db.String(100))
    battery_capacity = db.Column(db.Float)
    manufacture_date = db.Column(db.String(10))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    health_logs = db.relationship('BatteryHealthLog', backref='battery', lazy=True, cascade="all, delete-orphan")
    rfid_cards = db.relationship('RFIDCard', backref='battery', lazy=True, foreign_keys='RFIDCard.assigned_battery_id')
    slots = db.relationship('Slot', backref='battery', lazy=True, foreign_keys='Slot.battery_id')
    latest_soh_percent = column_property(
        select(BatteryHealthLog.soh_percent)
        .where(BatteryHealthLog.battery_id == id)
        .order_by(BatteryHealthLog.created_at.desc())
        .limit(1)
        .correlate_except(BatteryHealthLog) # Correlate with the outer Battery query's 'id'
        .scalar_subquery(),
        deferred=True # Defer loading until accessed, can be good for performance
    )

    latest_cycle_count = column_property(
        select(BatteryHealthLog.cycle_count)
        .where(BatteryHealthLog.battery_id == id)
        .order_by(BatteryHealthLog.created_at.desc())
        .limit(1)
        .correlate_except(BatteryHealthLog)
        .scalar_subquery(),
        deferred=True
    )

    def to_dict(self):
        return {
            'id': self.id,
            'station_id': self.station_id,
            'status': self.status,
            'serial_number': self.serial_number,
            'battery_type': self.battery_type,
            'battery_capacity': self.battery_capacity,
            'manufacture_date': self.manufacture_date,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'latest_soh_percent': self.latest_soh_percent,
            'latest_cycle_count': self.latest_cycle_count
        }

# ---------------- STATIONS ----------------
class Station(db.Model):
    __tablename__ = 'stations'
    
    id = db.Column(db.Integer, primary_key=True)
    location = db.Column(db.String(255))
    name = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


    batteries = db.relationship('Battery', backref='station', lazy=True)
    slots = db.relationship('Slot', backref='station', lazy=True)

# ---------------- SLOTS ----------------
class Slot(db.Model):
    __tablename__ = 'slots'
    id = db.Column(db.Integer, primary_key=True)
    station_id = db.Column(db.Integer, db.ForeignKey('stations.id'), nullable=False)
    slot_number = db.Column(db.Integer, nullable=False)
    battery_id = db.Column(db.Integer, db.ForeignKey('batteries.id'), nullable=True)
    status = db.Column(db.String(50), default='empty')  # 'empty', 'occupied', 'faulty'
    is_charging = db.Column(db.Boolean, default=False)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)

# ---------------- SWAPS ----------------
class Swap(db.Model):
    __tablename__ = 'swaps'
    id = db.Column(db.Integer, primary_key=True)
    issued_battery_id = db.Column(db.Integer,nullable=False)
    returned_battery_id = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    pickup_station_id = db.Column(db.Integer, db.ForeignKey('stations.id'))
    deposit_station_id = db.Column(db.Integer, db.ForeignKey('stations.id'))
    start_time = db.Column(db.DateTime)
    end_time = db.Column(db.DateTime)
    battery_percentage_start = db.Column(db.Float)
    battery_percentage_end = db.Column(db.Float)
    ah_used = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# ---------------- MONTHLY BILLING ----------------
class MonthlyBilling(db.Model):
    __tablename__ = 'monthly_billing'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    billing_month = db.Column(db.String(10))
    total_ah_used = db.Column(db.Float)
    ah_included = db.Column(db.Float)
    ah_excess = db.Column(db.Float)
    total_amount_due = db.Column(db.Float)
    paid_amount = db.Column(db.Float)
    payment_status = db.Column(db.String(50))
    payment_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)