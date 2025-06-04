from flask import Blueprint, request, jsonify
from models import db, Battery

battery_bp = Blueprint('battery', __name__)

@battery_bp.route('/batteries', methods=['POST'])
def create_battery():
    data = request.get_json()
    if not data or not data.get('serial_number') or not data.get('status'):
        return jsonify({"error": "Missing required fields: serial_number, status"}), 400
    
    new_battery = Battery(
        station_id=data.get('station_id'),
        status=data['status'],
        serial_number=data['serial_number'],
        battery_type=data.get('battery_type'),
        battery_capacity=data.get('battery_capacity'),
        manufacture_date=data.get('manufacture_date')
    )
    db.session.add(new_battery)
    db.session.commit()
    return jsonify({"message": "Battery created successfully", "battery_id": new_battery.id}), 201

@battery_bp.route('/batteries', methods=['GET'])
def get_batteries():
    batteries = Battery.query.all()
    return jsonify([battery.to_dict() for battery in batteries])


@battery_bp.route('/batteries/<int:battery_id>', methods=['GET'])
def get_battery(battery_id):
    battery = Battery.query.get_or_404(battery_id)
    return jsonify(battery.to_dict())


@battery_bp.route('/batteries/<int:battery_id>', methods=['PUT'])
def update_battery(battery_id):
    battery = Battery.query.get_or_404(battery_id)
    data = request.get_json()

    battery.station_id = data.get('station_id', battery.station_id)
    battery.status = data.get('status', battery.status)
    battery.serial_number = data.get('serial_number', battery.serial_number)
    battery.battery_type = data.get('battery_type', battery.battery_type)
    battery.battery_capacity = data.get('battery_capacity', battery.battery_capacity)
    battery.manufacture_date = data.get('manufacture_date', battery.manufacture_date)
    
    db.session.commit()
    return jsonify({"message": "Battery updated successfully"})

@battery_bp.route('/batteries/<int:battery_id>', methods=['DELETE'])
def delete_battery(battery_id):
    battery = Battery.query.get_or_404(battery_id)
    db.session.delete(battery)
    db.session.commit()
    return jsonify({"message": "Battery deleted successfully"})